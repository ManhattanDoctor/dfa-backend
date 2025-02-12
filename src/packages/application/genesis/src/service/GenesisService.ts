import { IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { TransportHttp, ExtendedError, Transport, ITransportCommand, TransportCryptoManager, TransportCryptoManagerEd25519 } from '@ts-core/common';
import { ILogger } from '@ts-core/common';
import { UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserStatus } from '@project/common/platform/user';
import { ImageUtil } from '@project/module/util';
import { Variables } from '@project/common/hlf';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { KeyAddCommand, KeyGetByOwnerCommand } from '@project/module/custody/transport';
import { DatabaseService } from '@project/module/database/service';
import { CompanyEntity } from '@project/module/database/company';
import { UserEditCommand, UserGetCommand } from '@project/common/hlf/transport';
import { LedgerApiClient } from '@hlf-explorer/common';
import { ITransportFabricCommandOptions } from '@hlf-core/transport-common';
import { IHlfSettings } from '@project/common/platform/settings';
import * as _ from 'lodash';

export class GenesisService extends TransportHttp<IKeycloakAdministratorSettings> {

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private hlf: LedgerApiClient;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, private transport: Transport, private database: DatabaseService, hlf: IHlfSettings, settings: IKeycloakAdministratorSettings) {
        super(logger, Object.assign(settings, { method: 'get', baseURL: settings.url, headers: {} }));
        this.hlf = new GenesisHlfClient(logger, hlf.url, hlf.name);
    }

    // --------------------------------------------------------------------------
    //
    //  Check Methods
    //
    // --------------------------------------------------------------------------

    private async check(login: string): Promise<void> {
        let company = await this.companyCheck();
        let key = await this.addKeyIfNeed(company.hlfUid);

        let openId = await this.addOpenIdUserIfNeed(login);
        await this.addUserIfNeed(openId.id, login, company.id, openId.email);

        await this.changeKeyIfNeed(company.hlfUid, key);
        this.log('Genesis completed');
        process.exit();
    }

    private async companyCheck(): Promise<CompanyEntity> {
        let item = await this.database.companyGet(Variables.seed.user.uid, false);
        if (_.isNil(item)) {
            this.error(`Unable to find platform company "${Variables.seed.user.uid}", please check database seeds`);
            process.exit();
        }
        return item;
    }

    private async changeKeyIfNeed(uid: string, key: Key): Promise<void> {
        let item = await this.hlf.ledgerRequestSendListen(new UserGetCommand({ uid, details: ['cryptoKey'] }));
        let { cryptoKey } = item;
        if (cryptoKey.value !== Variables.seed.cryptoKey.value) {
            this.log(`Hlf company crypto exists`);
            return;
        }
        await this.hlf.ledgerRequestSendListen(new UserEditCommand({ cryptoKey: { algorithm: key.algorithm, value: key.value }, uid }));
        this.warn(`Hlf company default crypto key changed`);
    }

    private async addKeyIfNeed(owner: string): Promise<Key> {
        let item = await this.transport.sendListen(new KeyGetByOwnerCommand(owner))
        if (!_.isNil(item)) {
            this.log(`Key for "${owner}" exists`);
            return item;
        }
        item = await this.transport.sendListen(new KeyAddCommand({ algorithm: KeyAlgorithm.ED25519, owner }));
        this.warn(`Key for "${owner}" added`);
        return item;
    }

    private async addUserIfNeed(id: string, login: string, companyId: number, email?: string): Promise<UserEntity> {
        let item = await this.database.userGet(login, false);
        if (!_.isNil(item)) {
            this.log(`User "${login}" exists`);
            return item;
        }
        item = UserEntity.createEntity({ id, login, status: UserStatus.ACTIVE, companyId });
        item.preferences = UserPreferencesEntity.createEntity({ name: login, picture: ImageUtil.getAvatar(id), email });
        await item.save();
        this.warn(`User "${login}" added`);

        return item;
    }

    private async addOpenIdUserIfNeed(login: string): Promise<IOpenIdUser> {
        let item = await this.getUser(login);
        if (!_.isNil(item)) {
            this.log(`OpenId user "${login}" exists`);
            return item;
        }

        let headers = { 'Content-Type': 'application/json' };
        let requiredActions = ['CONFIGURE_TOTP', 'UPDATE_PASSWORD', 'VERIFY_EMAIL'];
        await this.call(`admin/realms/${this.settings.realm}/users`, {
            data: JSON.stringify({ enabled: true, email: login, username: login }),
            method: 'post',
            headers
        });
        this.warn(`OpenId user "${login}" added`);
        item = await this.getUser(login);
        await this.call(`admin/realms/${this.settings.realm}/users/${item.id}/reset-password`, {
            data: JSON.stringify({ type: 'password', value: login, temporary: true }),
            method: 'put',
            headers
        });
        this.warn(`User "${login}" password reset, temporary password is "${login}"`);
        await this.call(`admin/realms/${this.settings.realm}/users/${item.id}`, {
            data: JSON.stringify({ requiredActions }),
            method: 'put',
            headers
        });
        this.warn(`User "${login}" required actions "${requiredActions.join(',')}"`);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

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

class GenesisHlfClient extends LedgerApiClient {
    protected async sign<U>(command: ITransportCommand<U>, options: ITransportFabricCommandOptions): Promise<void> {
        options.userId = Variables.seed.user.uid;
        options.signature = await TransportCryptoManager.sign(
            command,
            new TransportCryptoManagerEd25519(),
            {
                publicKey: Variables.seed.cryptoKey.value,
                privateKey: 'e87501bc00a3db3ba436f7109198e0cb65c5f929eabcedbbb5a9874abc2c73a3e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8'
            });
    }
}