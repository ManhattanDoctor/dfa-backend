import { Controller, Param, Get, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { Key } from '@project/common/custody';
import { KeyService } from '../service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`api/key/:uid`)
export class KeyGetController extends DefaultController<void, Key> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: KeyService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get key', response: Key })
    @Get()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('uid') uid: string, @OpenIdBearer() bearer: IOpenIdBearer): Promise<Key> {
        let item = await this.service.get(uid, bearer.user.sub);
        return item.toObject();
    }
}
