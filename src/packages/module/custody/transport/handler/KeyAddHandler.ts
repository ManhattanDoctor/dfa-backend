import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { Key } from '@project/common/custody';
import { IKeyAddDto, KeyAddCommand } from '../KeyAddCommand';
import { KeyService } from '../../service';
import * as _ from 'lodash';

@Injectable()
export class KeyAddHandler extends TransportCommandAsyncHandler<IKeyAddDto, Key, KeyAddCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private service: KeyService) {
        super(logger, transport, KeyAddCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IKeyAddDto): Promise<Key> {
        return this.service.add(params.owner, params.algorithm);
    }
}
