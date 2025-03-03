import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { CoinUtil } from '@project/common/platform/coin';
import { COIN_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdNeedResources } from '@project/module/openid';
import { DatabaseService } from '@project/module/database/service';
import { CoinEntity } from '@project/module/database/coin';
import { TransportSocket } from '@ts-core/socket-server';
import { CoinRemovedEvent } from '@project/common/platform/transport';
import { getSocketCoinRoom } from '@project/common/platform';
import * as _ from 'lodash';

@Controller(`${COIN_URL}/:id`)
export class CoinRemoveController extends DefaultController<number, void> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private socket: TransportSocket, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Coin remove', response: null })
    @Post()
    @OpenIdNeedResources()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @OpenIdBearer() bearer: IOpenIdBearer): Promise<void> {
        let item = await this.database.coinGet(id);
        CoinUtil.isCanRemove(bearer.company, item, bearer.resources, true);

        await CoinEntity.delete(id);
        this.socket.dispatch(new CoinRemovedEvent(id), { room: getSocketCoinRoom(id) });
    }
}
