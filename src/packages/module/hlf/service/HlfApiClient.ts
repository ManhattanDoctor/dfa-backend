import { LedgerApiClient } from '@hlf-explorer/common';
import { ITransportFabricCommandOptions } from '@hlf-core/transport-common';
import { ITransportCommand, TransportCommandAsync, ILogger, ClassType, ExtendedError, Transport } from '@ts-core/common';
import { IHlfSettings } from '@project/common/platform/settings';
import * as _ from 'lodash';

export class HlfApiClient extends LedgerApiClient {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public userId: string;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, private transport: Transport, settings: IHlfSettings) {
        super(logger, settings.url, settings.name);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async sign<U>(command: ITransportCommand<U>, options?: ITransportFabricCommandOptions, ledgerName?: string): Promise<void> {
        options.userId = this.userId;
        // options.signature = await TransportCryptoManager.sign(command, this.manager, { publicKey: this.publicKey, privateKey: this.privateKey });
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public async getCommandByEvent<U extends ITransportCommand<T>, T = any>(classType: ClassType<U>, requestId: string): Promise<U> {
        let transaction = await this.getTransaction(requestId);
        if (_.isNil(transaction)) {
            throw new ExtendedError(`Unable to find transaction by "${requestId}" request`);
        }
        if (transaction.validationCode !== 0) {
            throw new ExtendedError(`Transaction "${requestId}" finished by ${transaction.validationCode} validationCode`);
        }

        let item = new classType(transaction.request.request);
        if (item instanceof TransportCommandAsync) {
            item.response(transaction.response.response);
        }
        return item;
    }
}