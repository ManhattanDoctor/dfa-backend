import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { ICoinEditDto, CoinEditCommand } from '../CoinEditCommand';
import { DatabaseService } from '@project/module/database/service';
import { Coin } from '@project/common/platform/coin';
import { getSocketCoinRoom, CoinNotFoundError, CoinUndefinedError } from '@project/common/platform';
import { TransportSocket } from '@ts-core/socket-server';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { CoinChangedEvent } from '@project/common/platform/transport';
import * as _ from 'lodash';
import { ObjectUtil } from '@project/common/platform/util';

@Injectable()
export class CoinEditHandler extends TransportCommandAsyncHandler<ICoinEditDto, Coin, CoinEditCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private socket: TransportSocket, private database: DatabaseService) {
        super(logger, transport, CoinEditCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ICoinEditDto): Promise<Coin> {
        let { id } = params;
        if (_.isNil(id)) {
            throw new CoinUndefinedError();
        }
        let item = await this.database.coinGet(id);
        if (_.isNil(item)) {
            throw new CoinNotFoundError(id);
        }

        let isChanged = ObjectUtil.copy(params, item);
        if (!_.isNil(params.permissions)) {
            item.permissions = params.permissions;
            isChanged = true;
        }
        if (!_.isNil(params.series)) {
            item.series = params.series;
            isChanged = true;
        }
        if (!_.isNil(params.data)) {
            item.data = params.data;
            isChanged = true;
        }

        if (isChanged) {
            await item.save();
        }

        let value = item.toObject({ groups: TRANSFORM_SINGLE });
        if (isChanged) {
            this.socket.dispatch(new CoinChangedEvent(value), { room: getSocketCoinRoom(id) });
        }
        return value;
    }
}
