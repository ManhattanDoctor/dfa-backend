import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IInitDtoResponse } from '@project/common/platform/api/login';
import { User } from '@project/common/platform/user';
import { DefaultController } from '@ts-core/backend';
import { IJwtBearer, JwtBearer, JwtGuard } from '@ts-core/backend-nestjs-openid';
import { Logger } from '@ts-core/common';
import { IsNotEmpty } from 'class-validator';
import { INIT_URL } from '@project/common/platform/api';
import { DatabaseService } from '@project/module/database/service';
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

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @UseGuards(JwtGuard)
    public async executeExtended(@JwtBearer() bearer: IJwtBearer): Promise<IInitDtoResponse> {
        //let item = await this.database.userGet(bearer.user.sub);
        // return { user: item.toObject({ groups: TRANSFORM_SINGLE }) };
        return null;
    }
}
