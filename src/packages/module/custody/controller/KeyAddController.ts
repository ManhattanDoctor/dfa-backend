import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { ITraceable, Logger, Transport } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard } from '@ts-core/backend-nestjs-openid';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KeyAddCommand } from '../transport';
import { Key, KeyAlgorithm } from '@project/common/custody';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export interface IKeyAddDto extends ITraceable {
    algorithm: KeyAlgorithm;
}

class KeyAddDto implements IKeyAddDto {
    @ApiProperty()
    @IsEnum(KeyAlgorithm)
    public algorithm: KeyAlgorithm;

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

@Controller('api/key')
export class KeyAddController extends DefaultController<void, Key> {
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

    @Swagger({ name: 'Add key', response: Key })
    @Post()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Body() params: KeyAddDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<Key> {
        return this.transport.sendListen(new KeyAddCommand({ owner: bearer.user.sub, algorithm: params.algorithm }))
    }
}
