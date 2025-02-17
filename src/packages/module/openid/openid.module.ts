import { DynamicModule } from '@nestjs/common';
import { OpenIdModule as OpenIdModuleBase, OpenIdType } from '@ts-core/backend-nestjs-openid';
import { IKeycloakAdministratorSettings, IKeycloakSettings } from '@ts-core/openid-common';
import { OpenIdGetTokenByRefreshTokenController, OpenIdLogoutByRefreshTokenController } from './controller';
import { OpenIdGuard } from './lib';
import { OpenIdSynchronizeHandler, OpenIdUpdateHandler } from './transport/handler';
import { OpenIdAdministratorTransport } from './service';
import { Logger } from '@ts-core/common';

export class OpenIdModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IKeycloakSettings & IKeycloakAdministratorSettings): DynamicModule {
        return {
            module: OpenIdModule,
            imports: [
                OpenIdModuleBase.forServer({ type: OpenIdType.KEYCLOAK, isNeedControllers: true, settings })
            ],
            providers: [
                {
                    provide: OpenIdAdministratorTransport,
                    inject: [Logger],
                    useFactory: (logger) => new OpenIdAdministratorTransport(logger, settings)
                },
                OpenIdGuard,
                OpenIdUpdateHandler,
                OpenIdSynchronizeHandler
            ],
            controllers: [OpenIdLogoutByRefreshTokenController, OpenIdGetTokenByRefreshTokenController],
            exports: [OpenIdGuard],
            global: true
        };
    }
}