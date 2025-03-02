import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { CoinBalance } from '@project/common/platform/coin';
import { CoinBalanceUndefinedError, CoinBalanceNotFoundError, getSocketCoinBalanceRoom } from '@project/common/platform';
import { TransportSocket } from '@ts-core/socket-server';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { CoinBalanceChangedEvent } from '@project/common/platform/transport';
import { CoinBalanceEditCommand, ICoinBalanceEditDto } from '../CoinBalanceEditCommand';
import * as _ from 'lodash';

@Injectable()
export class CoinBalanceEditHandler extends TransportCommandAsyncHandler<ICoinBalanceEditDto, CoinBalance, CoinBalanceEditCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private socket: TransportSocket, private database: DatabaseService) {
        super(logger, transport, CoinBalanceEditCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ICoinBalanceEditDto): Promise<CoinBalance> {
        let { id } = params;
        if (_.isNil(id)) {
            throw new CoinBalanceUndefinedError();
        }
        let item = await this.database.coinBalanceGet(id);
        if (_.isNil(item)) {
            throw new CoinBalanceNotFoundError(id);
        }

        if (!_.isNil(params.held)) {
            item.held = params.held;
        }
        if (!_.isNil(params.inUse)) {
            item.inUse = params.inUse;
        }
        if (!_.isNil(params.total)) {
            item.total = params.total;
        }

        await item.save();

        let balance = item.toObject({ groups: TRANSFORM_SINGLE });
        this.socket.dispatch(new CoinBalanceChangedEvent(balance), { room: getSocketCoinBalanceRoom(balance.objectUid) });

        return balance;
    }
}
