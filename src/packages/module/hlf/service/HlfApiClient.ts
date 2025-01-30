import { Injectable } from '@nestjs/common';
import { ILedgerRequestRequest, LedgerApiClient as BaseLedgerApiClient } from '@hlf-explorer/common';
import { ITransportFabricCommandOptions } from '@hlf-core/transport-common';
import { TransportCryptoManager, ITransportCommand, TransportCommandAsync, ILogger, ClassType, ExtendedError, ITransportCryptoManager, TransportCryptoManagerEd25519 } from '@ts-core/common';
import { Variables } from '@project/common/hlf';
import * as _ from 'lodash';

@Injectable()
export class HlfApiClient extends BaseLedgerApiClient {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private manager: ITransportCryptoManager;

    private userId: string;
    private publicKey: string;
    private privateKey: string;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, url?: string, ledgerNameDefault?: string) {
        super(logger, url, ledgerNameDefault);
        this.manager = new TransportCryptoManagerEd25519();
        this.setRoot();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async createRequest<U>(command: ITransportCommand<U>, options?: ITransportFabricCommandOptions, ledgerName?: string): Promise<ILedgerRequestRequest> {
        let item = await super.createRequest<U>(command, options, ledgerName);
        options = item.options;

        options.userId = this.userId;
        options.signature = await TransportCryptoManager.sign(command, this.manager, { publicKey: this.publicKey, privateKey: this.privateKey });
        return item;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public setRoot(): void {
        this.userId = Variables.seed.user.uid;
        this.publicKey = Variables.seed.cryptoKey.value;
        this.privateKey = 'e87501bc00a3db3ba436f7109198e0cb65c5f929eabcedbbb5a9874abc2c73a3e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8';
    }

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