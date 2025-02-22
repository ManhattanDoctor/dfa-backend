import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { KeyVerifyCommand, IKeyVerifyDto } from '../KeyVerifyCommand';
import { KeyService } from '../../service';
import * as _ from 'lodash';

@Injectable()
export class KeyVerifyHandler extends TransportCommandAsyncHandler<IKeyVerifyDto, boolean, KeyVerifyCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private service: KeyService) {
        super(logger, transport, KeyVerifyCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IKeyVerifyDto): Promise<boolean> {
        return this.service.verify(params.uid, params.message, params.signature);
    }
}

