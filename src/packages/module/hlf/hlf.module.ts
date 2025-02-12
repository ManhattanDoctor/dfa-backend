import { DynamicModule, Provider } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { Transport } from '@ts-core/common';
import { Connection } from 'typeorm';
import { HlfApiClient, HlfMonitor, HlfService } from './service';
import { DatabaseModule } from '@project/module/database';
import { INFO_URL, LedgerApiClient } from '@hlf-explorer/common';
import { LedgerDatabase, LedgerMonitor } from '@hlf-explorer/monitor';
import { HlfBlockParseHandler } from './transport/handler';
import { IHlfSettings } from '@project/common/platform/settings';

export class HlfModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IHlfModuleSettings): DynamicModule {
        let providers: Array<Provider> = [
            {
                provide: HlfApiClient,
                inject: [Logger, Transport],
                useFactory: async (logger, transport) => {
                    let item = new HlfApiClient(logger, transport, settings);
                    item.logCommandFilters.push(item => item.name !== INFO_URL);
                    return item;
                },
            },
            {
                provide: LedgerDatabase,
                inject: [Logger, Connection],
                useFactory: async (logger, connection) => {
                    return new LedgerDatabase(logger, connection, settings.name);
                },
            },
            {
                provide: LedgerApiClient,
                useExisting: HlfApiClient
            },
            {
                provide: LedgerMonitor,
                useExisting: HlfMonitor
            },
            HlfMonitor,
            HlfService,
            HlfBlockParseHandler
        ];

        return {
            module: HlfModule,
            imports: [DatabaseModule],
            exports: [HlfService],
            global: true,
            providers,
        };
    }
}

export interface IHlfModuleSettings extends IHlfSettings { }
