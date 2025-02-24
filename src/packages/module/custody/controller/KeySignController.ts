import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { ISignature, ITraceable, Logger, Transport } from '@ts-core/common';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { KeyService } from '../service';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import * as _ from 'lodash';
import { KeySignCommand } from '../transport';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export interface IKeySignDto extends ITraceable {
    message: string;
    nonce?: string;
}

export class KeySignDto implements IKeySignDto {
    @ApiProperty()
    @IsString()
    public message: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public nonce?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/key/:uid/sign')
export class KeySignController extends DefaultController<void, ISignature> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private service: KeyService) {
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
    public async executeExtended(@Param('uid') uid: string, @Body() params: KeySignDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ISignature> {
        await this.service.get(uid, bearer.user.sub);
        return this.transport.sendListen(new KeySignCommand({ uid, message: params.message, nonce: params.nonce }));
    }
}
