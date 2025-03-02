import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { ICoinEditDtoResponse } from '@project/common/platform/api/coin';
import { Coin, CoinStatus, CoinUtil } from '@project/common/platform/coin';
import { COIN_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdNeedResources } from '@project/module/openid';
import { CoinEditCommand } from '../transport';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@Controller(`${COIN_URL}/:id/reject`)
export class CoinRejectController extends DefaultController<number, Coin> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Coin reject', response: Coin })
    @Post()
    @OpenIdNeedResources()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICoinEditDtoResponse> {
        let item = await this.database.coinGet(id);
        CoinUtil.isCanReject(item, bearer.resources, true);
        return this.transport.sendListen(new CoinEditCommand({ id, status: CoinStatus.REJECTED }));
    }
}
