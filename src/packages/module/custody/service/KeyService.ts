import { Injectable } from '@nestjs/common';
import { IKeyAsymmetric, Logger, LoggerWrapper, TraceUtil, Ed25519, UnreachableStatementError, ISignature } from '@ts-core/common';
import { KeyEntity } from '../entity';
import { KeyAlgorithm, KeyForbiddenError, KeyNotFoundError } from '@project/common/custody';
import { GostR3410 } from '@ts-core/crypto-gost';
import { RSA } from '@ts-core/crypto-rsa';
import * as _ from 'lodash';

@Injectable()
export class KeyService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    public getManager(algorithm: KeyAlgorithm): IKeyManager {
        switch (algorithm) {
            case KeyAlgorithm.GOST_R_3410:
                return GostR3410;
            case KeyAlgorithm.ED25519:
                return Ed25519;
            case KeyAlgorithm.RSA:
                return RSA;
            default:
                throw new UnreachableStatementError(algorithm);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async fake(owner: string): Promise<KeyEntity> {
        let item = await KeyEntity.findOneBy({ owner });
        return !_.isNil(item) ? item : this.add(owner, KeyAlgorithm.ED25519);
    }

    public async get(uid: string, owner?: string): Promise<KeyEntity> {
        let item = await KeyEntity.findOneBy({ uid });
        if (_.isNil(item)) {
            throw new KeyNotFoundError();
        }
        if (!_.isNil(owner) && item.owner !== owner) {
            throw new KeyForbiddenError();
        }
        return item;
    }

    public async add(owner: string, algorithm: KeyAlgorithm): Promise<KeyEntity> {
        let { privateKey, publicKey } = await this.getManager(algorithm).keys();

        let item = new KeyEntity();
        item.uid = TraceUtil.generate();
        item.owner = owner;
        item.algorithm = algorithm;
        item.value = publicKey;
        item.privateKey = privateKey;
        return item.save();
    }

    public async sign(uid: string, message: string, nonce?: string): Promise<ISignature> {
        let { algorithm, privateKey, value } = await this.get(uid);
        return { value: await this.getManager(algorithm).sign(message, privateKey), publicKey: value, algorithm, nonce }
    }

    public async verify(uid: string, message: string, signature: string): Promise<boolean> {
        let { algorithm, value } = await this.get(uid);
        return this.getManager(algorithm).verify(message, signature, value);
    }
}

interface IKeyManager {
    keys(): IKeyAsymmetric | Promise<IKeyAsymmetric>;
    sign(message: string, privateKey: string): string | Promise<string>;
    verify(message: string, signature: string, publicKey: string): boolean | Promise<boolean>;
}