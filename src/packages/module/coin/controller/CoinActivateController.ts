import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger, ObjectUtil, Transport } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { COIN_URL } from '@project/common/platform/api';
import { Coin, CoinStatus, CoinUtil } from '@project/common/platform/coin';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard, OpenIdNeedResources } from '@project/module/openid';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { CoinEditCommand, ICoinEditDto } from '../transport';
import { OpenIdService } from '@ts-core/openid-common';
import { Key, KeyAlgorithm } from '@project/common/custody';
import { KeyAddCommand, KeyGetByOwnerCommand } from '@project/module/custody/transport';
import { HlfService } from '@project/module/hlf/service';
import { CoinAddCommand, UserAddCommand } from '@project/common/hlf/transport';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@Controller(`${COIN_URL}/:id/activate`)
export class CoinActivateController extends DefaultController<void, Coin> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private hlf: HlfService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async activate(item: Coin, bearer: IOpenIdBearer): Promise<ICoinEditDto> {
        let { user } = bearer;
        if (_.isNil(item.hlfUid)) {
            let { uid } = await this.hlf.sendListen(new CoinAddCommand({ initiatorUid: user.uid, ticker: item.ticker, decimals: item.decimals, data: item.data, type: item.type, permissions: item.permissions, series: item.series }), null, bearer.company);
            item.hlfUid = uid;
        }
        return { id: item.id, status: CoinStatus.ACTIVE, hlfUid: item.hlfUid };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Coin activate', response: Coin })
    @Post()
    @OpenIdGetUserInfo()
    @OpenIdNeedResources()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @OpenIdBearer() bearer: IOpenIdBearer): Promise<Coin> {
        let item = await this.database.coinGet(id);
        CoinUtil.isCanActivate(bearer.company, item, bearer.resources, true);
        return this.transport.sendListen(new CoinEditCommand(await this.activate(item, bearer)));
    }
}
