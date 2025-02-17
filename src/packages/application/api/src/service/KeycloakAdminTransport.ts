import { KeycloakAdministratorTransport as KeycloakAdministratorTransportBase } from '@ts-core/openid-common';
import * as _ from 'lodash';

export class KeycloakAdministratorTransport extends KeycloakAdministratorTransportBase {

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async userGet<T = any>(username: string): Promise<T> {
        username = username.replaceAll('\\+', '%2B');
        let items = await this.call(`admin/realms/${this.settings.realm}/users`, { data: { username, exact: true } });
        return !_.isEmpty(items) ? _.first<any>(items) : null;
    }

    public async userAttributesSet<T>(login: string, attributes: T): Promise<void> {
        let { id, email } = await this.userGet(login);
        let data = { email, attributes };
        return this.call(`admin/realms/${this.settings.realm}/users/${id}`, { method: 'put', data });
    }
}
