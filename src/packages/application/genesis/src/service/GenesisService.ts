import { IKeycloakAdministratorSettings, KeycloakAdministratorTransport, KeycloakTokenManager } from '@ts-core/openid-common';
import { Transport, ITransportCommand, TransportCryptoManager, TransportCryptoManagerEd25519 } from '@ts-core/common';
import { ILogger } from '@ts-core/common';
import { UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserStatus } from '@project/common/platform/user';
import { ImageUtil } from '@project/common/platform/util';
import { Variables } from '@project/common/hlf';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { KeyAddCommand, KeyGetByOwnerCommand } from '@project/module/custody/transport';
import { DatabaseService } from '@project/module/database/service';
import { CompanyEntity } from '@project/module/database/company';
import { UserEditCommand, UserGetCommand } from '@project/common/hlf/transport';
import { LedgerApiClient } from '@hlf-explorer/common';
import { ITransportFabricCommandOptions } from '@hlf-core/transport-common';
import { IHlfSettings } from '@project/common/platform/settings';
import { Company } from '@project/common/platform/company';
import { IOpenIdAttributes } from '@project/module/openid/lib';
import * as _ from 'lodash';

export class GenesisService extends KeycloakAdministratorTransport {

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
        super(logger, settings);
        this.hlf = new GenesisHlfClient(logger, hlf.url, hlf.name);
        this.token = new KeycloakTokenManager();
    }

    // --------------------------------------------------------------------------
    //
    //  Check Methods
    //
    // --------------------------------------------------------------------------

    private async companyCheck(): Promise<CompanyEntity> {
        let item = await this.database.companyGet(Variables.seed.user.uid, false);
        if (_.isNil(item)) {
            this.error(`Unable to find platform company "${Variables.seed.user.uid}", please check database seeds`);
            process.exit();
        }
        return item;
    }

    private async changeKeyIfNeed(company: Company, key: Key): Promise<void> {
        let uid = company.hlfUid;
        let item = await this.hlf.ledgerRequestSendListen(new UserGetCommand({ uid, details: ['cryptoKey'] }));
        let { cryptoKey } = item;
        if (cryptoKey.value !== Variables.seed.cryptoKey.value) {
            this.log(`Hlf company crypto exists`);
            return;
        }
        await this.hlf.ledgerRequestSendListen(new UserEditCommand({ cryptoKey: { algorithm: key.algorithm, value: key.value }, uid }));
        this.warn(`Hlf company default crypto key changed`);
    }

    private async addKeyIfNeed(company: Company): Promise<Key> {
        let owner = company.hlfUid;
        let item = await this.transport.sendListen(new KeyGetByOwnerCommand(owner))
        if (!_.isNil(item)) {
            this.log(`Key for "${owner}" exists`);
            return item;
        }
        item = await this.transport.sendListen(new KeyAddCommand({ algorithm: KeyAlgorithm.ED25519, owner }));
        this.warn(`Key for "${owner}" added`);
        return item;
    }

    private async addUserIfNeed(login: string, openId: IOpenIdUser, company: Company): Promise<UserEntity> {
        let item = await this.database.userGet(login, false);
        if (!_.isNil(item)) {
            this.log(`User "${login}" exists`);
            return item;
        }

        item = UserEntity.createEntity({ id: openId.id, login, status: UserStatus.ACTIVE, companyId: company.id });
        item.preferences = UserPreferencesEntity.createEntity({ name: login, picture: ImageUtil.getUser(item.id), email: openId.email });
        await item.save();
        this.warn(`User "${login}" added`);

        return item;
    }

    private async addOpenIdUserIfNeed(login: string, company: Company): Promise<IOpenIdUser> {
        let enabled = true;
        let lastName = login;
        let firstName = login;
        let attributes: IOpenIdAttributes = { company: { id: company.id } };
        let credentials = [{ type: 'password', value: 'password', temporary: true }];
        let emailVerified = false;
        let requiredActions = ['CONFIGURE_TOTP', 'UPDATE_PASSWORD', 'VERIFY_EMAIL'];

        credentials = [{ type: 'password', value: '123', temporary: false }];
        emailVerified = true;
        requiredActions = [];

        let item = await this.getUser(login);
        if (_.isNil(item)) {
            await this.call(`admin/realms/${this.settings.realm}/users`, {
                data: {
                    email: login,
                    username: login,
                    enabled,
                    lastName,
                    firstName,
                    attributes,
                    credentials,
                    emailVerified,
                    requiredActions,
                },
                method: 'post'
            });
            this.warn(`OpenId user "${login}" added`);
        }
        else {
            await this.call(`admin/realms/${this.settings.realm}/users/${item.id}`, {
                data: {
                    email: item.email,
                    enabled,
                    lastName,
                    firstName,
                    attributes,
                    credentials,
                    emailVerified,
                    requiredActions,
                },
                method: 'put',
                headers: { 'Content-Type': 'application/json' }
            });
            this.log(`OpenId user "${login}" updated`);
        }
        return this.getUser(login);

        /*
        let headers = { 'Content-Type': 'application/json' };
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

        await this.call(`admin/realms/${this.settings.realm}/users/${item.id}`, {
            data: { email: item.email, attributes },
            method: 'put',
            headers
        });
        this.warn(`User "${login}" attributes company "${attributes}"`);
        */
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getUser(login: string): Promise<IOpenIdUser> {
        // Don't escape all chars because, for example, "@" char works without escaping
        login = login.replaceAll("\\+", "%2B");
        let items = await this.call(`admin/realms/${this.settings.realm}/users`, { data: { username: login, exact: true } });
        return !_.isEmpty(items) ? _.first<IOpenIdUser>(items) : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(login: string): Promise<void> {
        let company = await this.companyCheck();
        let key = await this.addKeyIfNeed(company);
        await this.changeKeyIfNeed(company, key);

        let openId = await this.addOpenIdUserIfNeed(login, company);
        await this.addUserIfNeed(login, openId, company);

        this.log('Genesis completed');
        process.exit();
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