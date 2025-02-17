import { IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { TransportHttp, ExtendedError, Transport } from '@ts-core/common';
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
import { IHlfSettings } from '@project/common/platform/settings';
import * as _ from 'lodash';

export class GenesisService extends TransportHttp<IKeycloakAdministratorSettings> {

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------



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
    }
}