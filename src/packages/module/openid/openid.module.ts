import { DynamicModule, Provider } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { OpenIdModule as OpenIdModuleBase, OpenIdType } from '@ts-core/backend-nestjs-openid';
import { IKeycloakSettings, IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { DatabaseModule } from '@project/module/database';
import { OpenIdGuard } from './OpenIdGuard';
import { OpenIdAdministratorService } from './OpenIdAdministratorService';
import { OpenIdGetTokenByRefreshTokenController } from './controller';

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
            },
            OpenIdGuard
        ];
        return {
            module: OpenIdModule,
            imports: [
                DatabaseModule,
                OpenIdModuleBase.forServer(
                    {
                        type: OpenIdType.KEYCLOAK,
                        settings: settings.client,
                        isNeedControllers: true
                    })
            ],
            global: true,
            controllers: [OpenIdGetTokenByRefreshTokenController],
            providers,
            exports: [
                OpenIdGuard,
                OpenIdAdministratorService
            ]
        };
    }
}

export interface IOpenIdModuleSettings {
    client: IKeycloakSettings;
    administrator: IKeycloakAdministratorSettings;
}
