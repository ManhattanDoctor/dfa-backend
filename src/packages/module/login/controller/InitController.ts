import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IInitDtoResponse } from '@project/common/platform/api/login';
import { User } from '@project/common/platform/user';
import { DefaultController } from '@ts-core/backend';
import { OpenIdBearer, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { Logger } from '@ts-core/common';
import { IsNotEmpty } from 'class-validator';
import { INIT_URL } from '@project/common/platform/api';
import { DatabaseService } from '@project/module/database/service';
import { OpenIdGuard, IOpenIdBearer } from '@project/module/openid';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class InitDtoResponse implements IInitDtoResponse {
    @ApiProperty()
    @IsNotEmpty()
    public user: User;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(INIT_URL)
export class InitController extends DefaultController<void, IInitDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
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
    public async executeExtended(@OpenIdBearer() bearer: IOpenIdBearer): Promise<IInitDtoResponse> {
        return { user: bearer.user };
    }
}
