import { IHlfSettings } from '@project/common/platform/settings';
import { IDatabaseSettings, EnvSettingsStorage } from '@ts-core/backend';
import { IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { ILogger, LoggerLevel, UrlUtil } from '@ts-core/common';
import * as _ from 'lodash';

export class AppSettings extends EnvSettingsStorage implements IDatabaseSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public logger?: ILogger;

    // --------------------------------------------------------------------------
    //
    //  Logger Properties
    //
    // --------------------------------------------------------------------------

    public get loggerLevel(): LoggerLevel {
        return this.getValue('LOGGER_LEVEL', LoggerLevel.ALL);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Database Properties
    //
    // --------------------------------------------------------------------------

    public get databaseUri(): string {
        return null;
    }

    public get databaseHost(): string {
        return this.getValue('POSTGRES_DB_HOST');
    }

    public get databasePort(): number {
        return this.getValue('POSTGRES_DB_PORT', 5432);
    }

    public get databaseName(): string {
        return this.getValue('POSTGRES_DB');
    }

    public get databaseUserName(): string {
        return this.getValue('POSTGRES_USER');
    }

    public get databaseUserPassword(): string {
        return this.getValue('POSTGRES_PASSWORD');
    }

    // --------------------------------------------------------------------------
    //
    //  Explorer Properties
    //
    // --------------------------------------------------------------------------

    public get hlf(): IHlfSettings {
        return { name: this.getValue('HLF_NAME'), url: UrlUtil.parseUrl(this.getValue('HLF_URL')) };
    }

    // --------------------------------------------------------------------------
    //
    //  Keycloak
    //
    // --------------------------------------------------------------------------

    public get keycloakLoginGenesis(): string {
        return this.getValue('KEYCLOAK_LOGIN_GENESIS')
    }

    public get keycloak(): IKeycloakAdministratorSettings {
        return {
            url: this.getValue('KEYCLOAK_URL'),
            realm: this.getValue('KEYCLOAK_REALM'),
            login: this.getValue('KEYCLOAK_LOGIN'),
            password: this.getValue('KEYCLOAK_PASSWORD'),
            clientId: this.getValue('KEYCLOAK_CLIENT_ID'),
            clientSecret: this.getValue('KEYCLOAK_CLIENT_SECRET'),
        }
    }
}