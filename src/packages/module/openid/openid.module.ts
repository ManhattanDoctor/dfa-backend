import { DynamicModule, Provider } from '@nestjs/common';
import { OpenIdModule as OpenIdModuleBase, OpenIdType } from '@ts-core/backend-nestjs-openid';
import { IKeycloakSettings } from '@ts-core/openid-common';
import { OpenIdGetTokenByRefreshTokenController, OpenIdLogoutByRefreshTokenController } from './controller';
import { OpenIdGuard } from './OpenIdGuard';

export class OpenIdModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IKeycloakSettings): DynamicModule {
        let providers: Array<Provider> = [OpenIdGuard];
        return {
            module: OpenIdModule,
            imports: [
                OpenIdModuleBase.forServer({ type: OpenIdType.KEYCLOAK, isNeedControllers: true, settings })
            ],
            global: true,
            controllers: [OpenIdLogoutByRefreshTokenController, OpenIdGetTokenByRefreshTokenController],
            exports: providers,
            providers
        };
    }
}