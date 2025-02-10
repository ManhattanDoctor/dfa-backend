import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { ITraceable, Logger } from '@ts-core/common';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { KeyService } from '../service';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import * as _ from 'lodash';
import { Swagger } from '@project/module/swagger';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export interface IKeySignDto extends ITraceable {
    message: string;
}

export class KeySignDto implements IKeySignDto {
    @ApiProperty()
    @IsString()
    public message: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/key/:uid/sign')
export class KeySignController extends DefaultController<void, string> {
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

    @Swagger({ name: 'Sign key', response: null })
    @Post()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('uid') uid: string, @Body() params: KeySignDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<string> {
        let item = await this.service.get(uid, bearer.user.sub);
        return this.service.sign(item.uid, params.message)
    }
}
