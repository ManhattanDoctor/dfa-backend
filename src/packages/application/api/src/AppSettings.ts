import { IHlfSettings } from '@project/common/platform/settings';
import { IDatabaseSettings, IWebSettings, EnvSettingsStorage } from '@ts-core/backend';
import { IKeycloakAdministratorSettings, IKeycloakSettings } from '@ts-core/openid-common';
import { AbstractSettingsStorage, ILogger, LoggerLevel, UrlUtil } from '@ts-core/common';
import * as jwk2pem from 'jwk-to-pem';
import axios from 'axios';
import * as _ from 'lodash';

export class AppSettings extends EnvSettingsStorage implements IWebSettings, IDatabaseSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public logger?: ILogger;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        let { url, realm } = this.keycloak;
        let { data } = await axios.get(`${UrlUtil.parseUrl(url)}realms/${realm}/protocol/openid-connect/certs`);
        this.data['KEYCLOAK_REALM_PUBLIC_KEY'] = AbstractSettingsStorage.parsePEM(jwk2pem(_.find(data.keys, { use: 'sig' })));
    }

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
    //  Web Properties
    //
    // --------------------------------------------------------------------------

    public get webPort(): number {
        return this.getValue('WEB_PORT');
    }

    public get webHost(): string {
        return this.getValue('WEB_HOST', 'localhost');
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

    public get keycloak(): IKeycloakSettings & IKeycloakAdministratorSettings{
        return {
            url: this.getValue('KEYCLOAK_URL'),
            realm: this.getValue('KEYCLOAK_REALM'),
            login: this.getValue('KEYCLOAK_LOGIN'),
            password: this.getValue('KEYCLOAK_PASSWORD'),
            clientId: this.getValue('KEYCLOAK_CLIENT_ID'),
            clientSecret: this.getValue('KEYCLOAK_CLIENT_SECRET'),
            realmPublicKey: this.getValue('KEYCLOAK_REALM_PUBLIC_KEY')
        }
    }
}