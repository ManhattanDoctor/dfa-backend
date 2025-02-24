
import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper, ITransportCommand, ITransportCommandAsync, ITransportCommandOptions } from '@ts-core/common';
import { HlfMonitor } from './HlfMonitor';
import { HlfApiClient, IHlfKeyOwner } from './HlfApiClient';
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
    //  Public Methods
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

    public async send<U, V>(command: ITransportCommand<U>, options?: ITransportCommandOptions, signer?: IHlfKeyOwner): Promise<void> {
        this.signer = signer;
        try {
            await this.api.ledgerRequestSend(command, options);
        }
        catch (error) {
            throw error;
        }
        finally {
            this.signer = null;
        }
    }

    public async sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions, signer?: IHlfKeyOwner): Promise<V> {
        this.signer = signer;
        try {
            return this.api.ledgerRequestSendListen(command, options);
        }
        catch (error) {
            throw error;
        }
        finally {
            this.signer = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get signer(): IHlfKeyOwner {
        return this.api.signer;
    }
    public set signer(value: IHlfKeyOwner) {
        this.api.signer = value;
    }
}