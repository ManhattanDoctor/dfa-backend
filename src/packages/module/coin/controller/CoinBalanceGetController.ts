import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { COIN_BALANCE_URL } from '@project/common/platform/api';
import { CoinBalance } from '@project/common/platform/coin';
import { CoinBalanceNotFoundError, ResourcePermission } from '@project/common/platform';
import { OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { ICoinBalanceGetDto } from '@hlf-core/coin';
import { TRANSFORM_SINGLE } from '@project/module/core';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COIN_BALANCE_URL}/:id`)
export class CoinBalanceGetController extends DefaultController<number, ICoinBalanceGetDto> {
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
    @OpenIdResourcePermission(ResourcePermission.COIN_BALANCE_READ)
    @UseGuards(OpenIdGuard)
    public async execute(@Param('id', ParseIntPipe) id: number): Promise<ICoinBalanceGetDto> {
        let item = await this.database.coinBalanceGet(id);
        if (_.isNil(item)) {
            throw new CoinBalanceNotFoundError(id);
        }
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
