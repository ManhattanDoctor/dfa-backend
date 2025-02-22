import { LedgerApiClient } from '@hlf-explorer/common';
import { ITransportFabricCommandOptions } from '@hlf-core/transport-common';
import { HlfTransportCommand } from '@hlf-core/common';
import { ITransportCommand, TransportCommandAsync, ILogger, ClassType, ExtendedError, Transport, TransportCryptoManager, ObjectUtil } from '@ts-core/common';
import { IHlfSettings } from '@project/common/platform/settings';
import { KeyTransportCryptoManager } from '@project/module/custody/service';
import * as _ from 'lodash';

export class HlfApiClient extends LedgerApiClient {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public userId: string;
    private manager: KeyTransportCryptoManager;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IHlfSettings, transport: Transport) {
        super(logger, settings.url, settings.name);
        this.manager = new KeyTransportCryptoManager(transport);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async sign<U>(command: HlfTransportCommand<U>, options?: ITransportFabricCommandOptions, ledgerName?: string): Promise<void> {
        options.userId = this.userId;
        if (!_.isNil(this.userId) && !command.isReadonly) {
            options.signature = await TransportCryptoManager.sign(command, this.manager, { publicKey: this.userId, privateKey: this.userId });
        }
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