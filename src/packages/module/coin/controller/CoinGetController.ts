import { ParseIntPipe, Controller, Param, Get, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { COIN_URL } from '@project/common/platform/api';
import { ICoinGetDtoResponse } from '@project/common/platform/api/coin';
import { Coin } from '@project/common/platform/coin';
import { OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { CoinNotFoundError, ResourcePermission } from '@project/common/platform';
import { TRANSFORM_SINGLE } from '@project/module/core';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COIN_URL}/:id`)
export class CoinGetController extends DefaultController<number, ICoinGetDtoResponse> {
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

    @Swagger({ name: 'Get coin', response: Coin })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.COIN_READ)
    @UseGuards(OpenIdGuard)
    public async execute(@Param('id', ParseIntPipe) id: number): Promise<ICoinGetDtoResponse> {
        let item = await this.database.coinGet(id, true);
        if (_.isNil(item)) {
            throw new CoinNotFoundError(id);
        }
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
