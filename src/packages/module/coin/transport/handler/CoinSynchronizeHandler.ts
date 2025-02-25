import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandHandler } from '@ts-core/common';
import { CoinSynchronizeCommand } from '../CoinSynchronizeCommand';
import { CoinEntity } from '@project/module/database/coin';
import { HlfService } from '@project/module/hlf/service';
import { DatabaseService } from '@project/module/database/service';
import { CoinNotFoundError } from '@project/common/platform';
import * as _ from 'lodash';
import { CoinEditCommand } from '../CoinEditCommand';
import { CoinGetCommand } from '@project/common/hlf/transport';

@Injectable()
export class CoinSynchronizeHandler extends TransportCommandHandler<string, CoinSynchronizeCommand> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private hlf: HlfService) {
        super(logger, transport, CoinSynchronizeCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: string): Promise<void> {
        let coin = await this.hlf.sendListen(new CoinGetCommand({ uid: params, details: ['data', 'balance', 'permissions'] }));
        if (_.isNil(coin)) {
            throw new CoinNotFoundError(params);
        }
        await this.transport.sendListen(new CoinEditCommand({ id: params, balance: coin.balance, data: coin.data, permissions: coin.permissions }))
    }
}
