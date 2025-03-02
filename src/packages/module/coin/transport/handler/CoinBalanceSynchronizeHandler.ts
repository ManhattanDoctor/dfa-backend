import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandHandler } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { ICoinBalanceSynchronizeDto, CoinBalanceSynchronizeCommand } from '../CoinBalanceSynchronizeCommand';
import { TransportSocket } from '@ts-core/socket-server';
import { CoinBalanceEntity } from '@project/module/database/coin';
import { CoinBalanceGetCommand } from '@hlf-core/coin';
import { HlfService } from '@project/module/hlf/service';
import { CoinNotFoundError } from '@project/common/platform';
import { CoinBalanceEditCommand } from '../CoinBalanceEditCommand';
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

        let item = await CoinBalanceEntity.createQueryBuilder('coinBalance')
            .where('coinBalance.objectUid = :objectUid', { objectUid })
            .andWhere('coinBalance.coinUid = :coinUid', { coinUid })
            .getOne();

        if (_.isNil(item)) {
            let coin = await this.database.coinGet(coinUid);
            if (_.isNil(coin)) {
                throw new CoinNotFoundError(coinUid);
            }
            item = new CoinBalanceEntity();
            item.coinId = coin.id;
            item.coinUid = coinUid;
            item.objectUid = objectUid;
            await item.save();
        }
        await this.transport.sendListen(new CoinBalanceEditCommand({ id: item.id, held: balance.held, inUse: balance.inUse, total: balance.total }));
    }
}
