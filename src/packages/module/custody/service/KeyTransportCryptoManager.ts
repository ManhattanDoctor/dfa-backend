
import { ExtendedError, ISignature, ITransportCommand, Transport, TransportCryptoManager, TransportCryptoManagerEd25519 } from '@ts-core/common';
import { KeyGetByOwnerCommand, KeySignCommand, KeyVerifyCommand } from '../transport';
import * as _ from 'lodash';

export class KeyTransportCryptoManager extends TransportCryptoManager {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = TransportCryptoManagerEd25519.ALGORITHM;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected transport: Transport) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async getKeyId(owner: string): Promise<string> {
        let key = await this.transport.sendListen(new KeyGetByOwnerCommand(owner));
        if (_.isNil(key)) {
            throw new ExtendedError(`Unable to find key for "${owner}"`);
        }
        return key.uid;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async sign<U>(command: ITransportCommand<U>, nonce: string, privateKey: string): Promise<string> {
        let { value } = await this.transport.sendListen(new KeySignCommand({ uid: await this.getKeyId(privateKey), message: this.toSign(command, nonce) }));
        return value;
    }

    public async verify<U>(command: ITransportCommand<U>, signature: ISignature): Promise<boolean> {
        return this.transport.sendListen(new KeyVerifyCommand({ uid: await this.getKeyId(signature.publicKey), message: this.toSign(command, signature.nonce), signature: signature.value }));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    public get algorithm(): string {
        return KeyTransportCryptoManager.ALGORITHM;
    }
}