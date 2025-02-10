import { DynamicModule, Provider } from '@nestjs/common';
import { Logger, Transport } from '@ts-core/common';
import { IKeycloakAdministratorSettings } from '@ts-core/openid-common';
import { DatabaseService } from '@project/module/database/service';
import { GenesisService } from './GenesisService';

export class GenesisModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IKeycloakAdministratorSettings): DynamicModule {
        let providers: Array<Provider> = [
            {
                provide: GenesisService,
                inject: [Logger, Transport, DatabaseService],
                useFactory: async (logger, transport, database) => {
                    return new GenesisService(logger, transport, database, settings)
                }
            }
        ];
        return {
            module: GenesisModule,
            global: true,
            exports: providers,
            providers,
        };
    }
}