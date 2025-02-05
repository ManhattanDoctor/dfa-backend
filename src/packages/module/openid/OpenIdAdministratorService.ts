import { IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { TransportHttp, ExtendedError } from '@ts-core/common';
import { ILogger } from '@ts-core/common';
import * as _ from 'lodash';

export class OpenIdAdministratorService extends TransportHttp<IKeycloakAdministratorSettings> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IKeycloakAdministratorSettings) {
        super(logger, Object.assign(settings, { method: 'get', baseURL: settings.url, headers: {} }));
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------



    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        try {
            let { access_token } = await this.call('realms/master/protocol/openid-connect/token', {
                data: new URLSearchParams({
                    username: this.settings.userName,
                    password: this.settings.userPassword,
                    grant_type: 'password',
                    client_id: 'admin-cli'
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'POST'
            });
            this.headers.Authorization = `Bearer ${access_token}`;
        }
        catch (error) {
            throw new ExtendedError(`Unable to get keycloak admin token: ${error.message}`)
        }

        //await this.checkRealmRoles();
    }
    /*

public async isExists(item: User): Promise<boolean> {
    return !_.isNil(await this.getUserId(item.username));
}

public async getUserId(username: string): Promise<string> {
    // Don't escape all chars because, for example, "@" char works without escaping
    username = username.replaceAll("\\+", "%2B");
    let items = await this.call(`admin/realms/${this.settings.keycloakRealm}/users`, { data: { username, exact: true } });
    return !_.isEmpty(items) ? _.first<any>(items).id : null;
}

public async addUser(item: User): Promise<void> {
    await this.call(`admin/realms/${this.settings.keycloakRealm}/users`, {
        data: JSON.stringify(item.toObject()),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let role = item.getRealmRole();
    if (!_.isNil(role)) {
        await this.assignRealmRoleToUser(item.username, role);
    }
}

public async addRealmRole(name: RealmRole): Promise<void> {
    return this.call(`admin/realms/${this.settings.keycloakRealm}/roles`, {
        data: { name },
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

public async getRealmRoleId(name: RealmRole): Promise<string> {
    let item = await this.call(`admin/realms/${this.settings.keycloakRealm}/roles/${name}`);
    return !_.isNil(item) ? item.id : null;
}

public async assignRealmRoleToUser(username: string, role: RealmRole): Promise<void> {
    let userId = await this.getUserId(username);
    return this.call(`admin/realms/${this.settings.keycloakRealm}/users/${userId}/role-mappings/realm`, {
        data: [
            {
                id: await this.getRealmRoleId(role),
                name: role
            }
        ],
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
*/
}