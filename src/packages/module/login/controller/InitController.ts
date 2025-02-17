import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IInitDtoResponse } from '@project/common/platform/api/login';
import { User } from '@project/common/platform/user';
import { DefaultController } from '@ts-core/backend';
import { OpenIdBearer, OpenIdGetUserInfo, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { Logger } from '@ts-core/common';
import { IsNotEmpty } from 'class-validator';
import { INIT_URL } from '@project/common/platform/api';
import { OpenIdGuard, IOpenIdBearer } from '@project/module/openid';
import { Company } from '@project/common/platform/company';
import { TRANSFORM_SINGLE } from '@project/module/core';
import * as _ from 'lodash'

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class InitDtoResponse implements IInitDtoResponse {
    @ApiProperty()
    @IsNotEmpty()
    public user: User;

    @ApiProperty()
    public company: Company;
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
    @OpenIdGetUserInfo()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@OpenIdBearer() bearer: IOpenIdBearer): Promise<IInitDtoResponse> {
        return { user: bearer.user.toObject({ groups: TRANSFORM_SINGLE }), company: bearer.user.company?.toObject({ groups: TRANSFORM_SINGLE }) };
    }
}
