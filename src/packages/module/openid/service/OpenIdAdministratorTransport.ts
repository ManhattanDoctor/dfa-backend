import { IKeycloakAdministratorSettings, IOpenIdUser, KeycloakAdministratorTransport, KeycloakTokenManager } from '@ts-core/openid-common';
import { ILogger } from '@ts-core/common';
import { IOpenIdAttributes } from '../lib';
import { UserNotFoundError } from '@project/common/platform';
import * as _ from 'lodash';

export class OpenIdAdministratorTransport extends KeycloakAdministratorTransport {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IKeycloakAdministratorSettings) {
        super(logger, settings);
        this.token = new KeycloakTokenManager();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getUser(login: string): Promise<IOpenIdUser> {
        login = login.replaceAll('\\+', '%2B');
        let items = await this.call(`admin/realms/${this.settings.realm}/users`, { data: { username: login, exact: true } });
        if (_.isEmpty(items)) {
            throw new UserNotFoundError(login);
        }
        return _.first<IOpenIdUser>(items);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async update(login: string, attributes: IOpenIdAttributes): Promise<IOpenIdUser> {
        let { id, email, firstName, lastName } = await this.getUser(login);
        if (!_.isNil(attributes)) {
            for (let [key, value] of Object.entries(attributes)) {
                if (_.isObject(value)) {
                    attributes[key] = JSON.stringify(value);
                }
            }
        }
        await this.call(`admin/realms/${this.settings.realm}/users/${id}`, {
            data: {
                email,
                lastName,
                firstName,
                attributes,
            },
            method: 'put',
            headers: { 'Content-Type': 'application/json' }
        });
        return this.getUser(login);
    }
}