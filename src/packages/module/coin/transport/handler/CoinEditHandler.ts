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
        let item = await this.database.coinGet(id, true);
        if (_.isNil(item)) {
            throw new CoinNotFoundError(id);
        }

        if (!_.isNil(params.status)) {
            item.status = params.status;
        }
        if (!_.isNil(params.hlfUid)) {
            item.hlfUid = params.hlfUid;
        }
        if (!_.isNil(params.data)) {
            item.data = params.data;
        }
        if (!_.isNil(params.balance)) {
            item.balance = params.balance;
        }
        if (!_.isNil(params.permissions)) {
            item.permissions = params.permissions;
        }

        console.log(item);
        await item.save();

        let coin = item.toObject({ groups: TRANSFORM_SINGLE });
        this.socket.dispatch(new CoinChangedEvent(coin), { room: getSocketCoinRoom(coin.id) });

        return coin;
    }
}
