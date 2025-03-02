import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { COIN_URL } from '@project/common/platform/api';
import { Coin, CoinStatus, CoinUtil } from '@project/common/platform/coin';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard, OpenIdNeedResources } from '@project/module/openid';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { CoinEditCommand } from '../transport';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@Controller(`${COIN_URL}/:id/submit`)
export class CoinSubmitController extends DefaultController<void, Coin> {
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

    @Swagger({ name: 'Coin to verify', response: Coin })
    @Post()
    @OpenIdGetUserInfo()
    @OpenIdNeedResources()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @OpenIdBearer() bearer: IOpenIdBearer): Promise<Coin> {
        let item = await this.database.coinGet(id);
        CoinUtil.isCanSubmit(bearer.company, item, bearer.resources, true);
        return this.transport.sendListen(new CoinEditCommand({ id, status: CoinStatus.VERIFICATION_PROCESS }));
    }
}
