import { IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { TransportHttp, ExtendedError, Transport } from '@ts-core/common';
import { ILogger } from '@ts-core/common';
import { UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserStatus } from '@project/common/platform/user';
import { ImageUtil } from '@project/module/util';
import { Variables } from '@project/common/hlf';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { KeyAddCommand, KeyGetByOwnerCommand } from '@project/module/custody/transport';
import { DatabaseService } from '@project/module/database/service';
import { CompanyEntity } from '@project/module/database/company';
import * as _ from 'lodash';

export class GenesisService extends TransportHttp<IKeycloakAdministratorSettings> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, private transport: Transport, private database: DatabaseService, settings: IKeycloakAdministratorSettings) {
        super(logger, Object.assign(settings, { method: 'get', baseURL: settings.url, headers: {} }));
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async check(login: string): Promise<void> {
        let company = await this.companyCheck();
        let key = await this.addKeyIfNeed(company.hlfUid);

        let openId = await this.addOpenIdUserIfNeed(login);
        let user = await this.addUserIfNeed(openId.id, login, company.id, openId.email);
    }

    private async companyCheck(): Promise<CompanyEntity> {
        let item = await this.database.companyGet(Variables.seed.user.uid, false);
        if (_.isNil(item)) {
            this.error(`Unable to find platform company "${Variables.seed.user.uid}", please check database seeds`);
            process.exit();
        }
        return item;
    }

    private async addKeyIfNeed(owner: string): Promise<Key> {
        let item = await this.transport.sendListen(new KeyGetByOwnerCommand(owner))
        if (!_.isNil(item)) {
            this.log(`Key for "${owner}" already exists`);
            return item;
        }
        item = await this.transport.sendListen(new KeyAddCommand({ algorithm: KeyAlgorithm.ED25519, owner }));
        this.log(`Key for "${owner}" added`);
        return item;
    }

    private async addUserIfNeed(id: string, login: string, companyId: number, email?: string): Promise<UserEntity> {
        let item = await this.database.userGet(login, false);
        if (!_.isNil(item)) {
            this.log(`User "${login}" already exists`);
            return item;
        }
        item = UserEntity.createEntity({ id, login, status: UserStatus.ACTIVE, companyId });
        item.preferences = UserPreferencesEntity.createEntity({ name: login, picture: ImageUtil.getAvatar(id), email });
        await item.save();
        this.log(`User "${login}" added`);

        return item;
    }

    private async addOpenIdUserIfNeed(login: string): Promise<IOpenIdUser> {
        let item = await this.getUser(login);
        if (!_.isNil(item)) {
            this.log(`OpenId user "${login}" already exists`);
            return item;
        }

        let headers = { 'Content-Type': 'application/json' };
        let requiredActions = ['CONFIGURE_TOTP', 'UPDATE_PASSWORD', 'VERIFY_EMAIL'];
        await this.call(`admin/realms/${this.settings.realm}/users`, {
            data: JSON.stringify({ enabled: true, email: login, username: login }),
            method: 'post',
            headers
        });
        this.log(`OpenId user "${login}" added`);
        item = await this.getUser(login);
        await this.call(`admin/realms/${this.settings.realm}/users/${item.id}/reset-password`, {
            data: JSON.stringify({ type: 'password', value: login, temporary: true }),
            method: 'put',
            headers
        });
        this.log(`User "${login}" password reseted, temporary password is "${login}"`);
        await this.call(`admin/realms/${this.settings.realm}/users/${item.id}`, {
            data: JSON.stringify({ requiredActions }),
            method: 'put',
            headers
        });
        this.log(`User "${login}" required actions "${requiredActions.join(',')}"`);
        return item;
    }

    private async getUser(username: string): Promise<IOpenIdUser> {
        // Don't escape all chars because, for example, "@" char works without escaping
        username = username.replaceAll("\\+", "%2B");
        let items = await this.call(`admin/realms/${this.settings.realm}/users`, { data: { username, exact: true } });
        return !_.isEmpty(items) ? _.first<IOpenIdUser>(items) : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(login: string): Promise<void> {
        try {
            let { access_token } = await this.call('realms/master/protocol/openid-connect/token', {
                data: new URLSearchParams({
                    username: this.settings.userName,
                    password: this.settings.userPassword,
                    grant_type: 'password',
                    client_id: 'admin-cli'
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'post'
            });
            this.headers.Authorization = `Bearer ${access_token}`;
        }
        catch (error) {
            throw new ExtendedError(`Unable to get keycloak admin token: ${error.message}`)
        }
        await this.check(login);
    }
}

interface IOpenIdUser {
    id: string;
    totp: boolean;
    email: string;
    username: string;
    enabled: boolean;
    emailVerified: boolean;
}