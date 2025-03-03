import { LedgerApiClient } from '@hlf-explorer/common';
import { ITransportFabricCommandOptions } from '@hlf-core/transport-common';
import { HlfTransportCommand } from '@hlf-core/common';
import { ITransportCommand, TransportCommandAsync, ILogger, ClassType, ExtendedError, Transport, TransportCryptoManager, ObjectUtil, ISignature, TransportCryptoManagerEd25519 } from '@ts-core/common';
import { IHlfSettings } from '@project/common/platform/settings';
import { KeyGetByOwnerCommand, KeySignCommand } from '@project/module/custody/transport';
import { Variables } from '@project/common/hlf';
import * as _ from 'lodash';

export class HlfApiClient extends LedgerApiClient {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public signer: IHlfKeyOwner;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IHlfSettings, private transport: Transport) {
        super(logger, settings.url, settings.name);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async sign<U>(command: HlfTransportCommand<U>, options?: ITransportFabricCommandOptions, ledgerName?: string): Promise<void> {
        if (_.isNil(this.signer) || command.isReadonly) {
            return;
        }
        /*
        options.userId = Variables.seed.user.uid;
        options.signature = await TransportCryptoManager.sign(command, new TransportCryptoManagerEd25519(), { publicKey: Variables.seed.cryptoKey.value, privateKey: 'e87501bc00a3db3ba436f7109198e0cb65c5f929eabcedbbb5a9874abc2c73a3e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8' });
        */
        let nonce = Date.now().toString();
        options.userId = this.signer.hlfUid;
        options.signature = await this.transport.sendListen(new KeySignCommand({ uid: await this.getKeyUid(this.signer.uid), message: TransportCryptoManager.toSign(command, nonce), nonce }));
    }

    protected async getKeyUid(owner: string): Promise<string> {
        let key = await this.transport.sendListen(new KeyGetByOwnerCommand(owner));
        if (_.isNil(key)) {
            throw new ExtendedError(`Unable to find key for "${owner}"`);
        }
        return key.uid;
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

export interface IHlfKeyOwner {
    uid: string;
    hlfUid?: string;
}