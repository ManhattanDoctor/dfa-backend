import { Controller, Get, Param } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { COIN_BALANCE_URL } from '@project/common/platform/api';
import { CoinBalance } from '@project/common/platform/coin';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COIN_BALANCE_URL}/:coinUid/:objectUid`)
export class CoinBalanceGetController extends DefaultController<string, CoinBalance> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get coin balance', response: CoinBalance })
    @Get()
    public async executeExtended(@Param('coinUid') coinUid: string, @Param('objectUid') objectUid: string,): Promise<CoinBalance> {
        let item = await this.database.coinBalanceGet(objectUid, coinUid);
        return !_.isNil(item) ? item.toObject() : null;
    }
}
