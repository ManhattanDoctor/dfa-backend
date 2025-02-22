
import { ISignature, ITransportCommand, Transport, TransportCryptoManager, TransportCryptoManagerEd25519 } from '@ts-core/common';
import { KeyGetByOwnerCommand, KeySignCommand, KeyVerifyCommand } from '../transport';

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
        let { uid } = await this.transport.sendListen(new KeyGetByOwnerCommand(owner));
        return uid;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async sign<U>(command: ITransportCommand<U>, nonce: string, privateKey: string): Promise<string> {
        return this.transport.sendListen(new KeySignCommand({ uid: await this.getKeyId(privateKey), message: this.toSign(command, nonce) }));
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