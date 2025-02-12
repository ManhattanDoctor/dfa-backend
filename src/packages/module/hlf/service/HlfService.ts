
import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper, ITransportCommand, ITransportCommandAsync, ITransportCommandOptions } from '@ts-core/common';
import { HlfMonitor } from './HlfMonitor';
import { HlfApiClient } from './HlfApiClient';
import * as _ from 'lodash';

@Injectable()
export class HlfService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private api: HlfApiClient, private monitor: HlfMonitor) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Other Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        try {
            await this.monitor.start();
        }
        catch (error) {
            this.error(`Unable to connect and monitor blocks: "${error.message}"`, error);
        }
    }

    public async send<U, V>(command: ITransportCommand<U>, options?: ITransportCommandOptions, ledgerName?: string): Promise<void> {
        await this.api.ledgerRequestSend(command, options, ledgerName);
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions, ledgerName?: string): Promise<V> {
        return this.api.ledgerRequestSendListen(command, options, ledgerName);
    }
}