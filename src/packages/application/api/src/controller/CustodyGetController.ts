import { Controller, Get, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger, Transport } from '@ts-core/common';
import { OpenIdBearer, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { Key } from '@project/common/custody';
import { OpenIdGuard, IOpenIdBearer } from '@project/module/openid';
import { CompanyNotFoundError } from '@project/common/platform';
import { CUSTODY_URL } from '@project/common/platform/api';
import { KeyGetByOwnerCommand } from '@project/module/custody/transport';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(CUSTODY_URL)
export class CustodyKeyGetController extends DefaultController<void, Key> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@OpenIdBearer() bearer: IOpenIdBearer): Promise<Key> {
        let { company } = bearer.user;
        if (_.isNil(company)) {
            throw new CompanyNotFoundError();
        }
        return this.transport.sendListen(new KeyGetByOwnerCommand(bearer.user.company.hlfUid));
    }
}
