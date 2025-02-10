import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { Key, KeyNotFoundError } from '@project/common/custody';
import { KeyGetByOwnerCommand } from '../KeyGetByOwnerCommand';
import { KeyEntity } from '../../entity';
import * as _ from 'lodash';

@Injectable()
export class KeyGetByOwnerHandler extends TransportCommandAsyncHandler<string, Key, KeyGetByOwnerCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport) {
        super(logger, transport, KeyGetByOwnerCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string): Promise<Key> {
        let item = await KeyEntity.findOneBy({ owner: params });
        return !_.isNil(item) ? item.toObject() : null;
    }
}
