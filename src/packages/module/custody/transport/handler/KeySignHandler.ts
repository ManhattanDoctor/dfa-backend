import { Injectable } from '@nestjs/common';
import { ISignature, Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { KeySignCommand, IKeySignDto } from '../KeySignCommand';
import { KeyService } from '../../service';
import * as _ from 'lodash';

@Injectable()
export class KeySignHandler extends TransportCommandAsyncHandler<IKeySignDto, ISignature, KeySignCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private service: KeyService) {
        super(logger, transport, KeySignCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IKeySignDto): Promise<ISignature> {
        return this.service.sign(params.uid, params.message, params.nonce);
    }
}

