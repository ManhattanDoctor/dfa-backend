import { DynamicModule, Provider } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { IKeycloakAdministratorSettings, IKeycloakSettings, OpenIdModule as OpenIdModuleBase, OpenIdService, OpenIdType } from '@ts-core/backend-nestjs-openid';
import { OpenIdAdministratorService } from './service';

export class OpenIdModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IOpenIdModuleSettings): DynamicModule {
        let providers: Array<Provider> = [
            {
                provide: OpenIdAdministratorService,
                inject: [Logger],
                useFactory: async (logger) => {
                    return new OpenIdAdministratorService(logger, settings.administrator);
                }
            }
        ];
        return {
            module: OpenIdModule,
            imports: [
                OpenIdModuleBase.forServer(
                    {
                        type: OpenIdType.KEYCLOAK,
                        settings: settings.client,
                        isNeedControllers: true
                    })
            ],
            global: true,
            providers,
            exports: [
                OpenIdAdministratorService
            ]
        };
    }
}

export interface IOpenIdModuleSettings {
    client: IKeycloakSettings;
    administrator: IKeycloakAdministratorSettings;
}
