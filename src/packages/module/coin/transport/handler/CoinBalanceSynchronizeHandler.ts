import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandHandler } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { ICoinBalanceSynchronizeDto, CoinBalanceSynchronizeCommand } from '../CoinBalanceSynchronizeCommand';
import { TransportSocket } from '@ts-core/socket-server';
import { CoinBalanceEntity, CoinEntity } from '@project/module/database/coin';
import { CoinBalanceGetCommand } from '@hlf-core/coin';
import { CoinBalanceChangedEvent } from '@project/common/platform/transport';
import { HlfService } from '@project/module/hlf/service';
import { getSocketCoinBalanceRoom } from '@project/common/platform';
import * as _ from 'lodash';

@Injectable()
export class CoinBalanceSynchronizeHandler extends TransportCommandHandler<ICoinBalanceSynchronizeDto, CoinBalanceSynchronizeCommand> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private hlf: HlfService, private socket: TransportSocket) {
        super(logger, transport, CoinBalanceSynchronizeCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ICoinBalanceSynchronizeDto): Promise<void> {
        let { objectUid, coinUid } = params;
        let balance = await this.hlf.sendListen(new CoinBalanceGetCommand({ objectUid, coinUid }));

        let item = await this.database.coinBalanceGet(objectUid, coinUid);
        if (_.isNil(item)) {
            let { id } = await CoinEntity.findOneByOrFail({ hlfUid: coinUid });
            
            item = new CoinBalanceEntity();
            item.coinId = id;
            item.coinUid = coinUid;
            item.objectUid = objectUid;
        }
        console.log(balance);
        await CoinBalanceEntity.updateEntity(item, balance).save();
        this.socket.dispatch(new CoinBalanceChangedEvent(item.toObject()), { room: getSocketCoinBalanceRoom(params.objectUid) });
    }
}
