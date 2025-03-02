import { Controller, Post, UseGuards } from '@nestjs/common';
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
import { UserAddCommand } from '@project/common/hlf/transport';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@Controller(`${COIN_URL}/:id/activate`)
export class CoinActivateController extends DefaultController<void, Coin> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private openId: OpenIdService, private hlf: HlfService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    /*
    private async activate(bearer: IOpenIdBearer): Promise<ICoinEditDto> {
        let { user } = bearer;
        if (_.isNil(coin.hlfUid)) {
            let { algorithm, value } = await this.addKeyIfNeed(coin.uid);
            let { uid } = await this.hlf.sendListen(new UserAddCommand({ initiatorUid: user.uid, cryptoKey: { algorithm, value } }), null, await this.database.coinPlatformGet());
            coin.hlfUid = uid;
        }
        return { id: coin.id, status: CoinStatus.ACTIVE, hlfUid: coin.hlfUid };
    }
    */


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
    public async executeExtended(@OpenIdBearer() bearer: IOpenIdBearer): Promise<Coin> {
        /*
        CoinUtil.isCanActivate(bearer.coin, bearer.res, true);
        return this.transport.sendListen(new CoinEditCommand(await this.activate(bearer)));
        */
        return null;
    }
}
