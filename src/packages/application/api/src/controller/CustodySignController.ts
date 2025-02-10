import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger, Transport } from '@ts-core/common';
import { IsString } from 'class-validator';
import { OpenIdOfflineValidation, OpenIdBearer } from '@ts-core/backend-nestjs-openid';
import { CUSTODY_URL } from '@project/common/platform/api';
import { ApiProperty } from '@nestjs/swagger';
import { OpenIdGuard, IOpenIdBearer } from '@project/module/openid';
import { CompanyNotFoundError } from '@project/common/platform';
import { KeyGetByOwnerCommand, KeySignCommand } from '@project/module/custody/transport';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export interface IKeySignDto {
    message: string;
}

export class KeySignDto implements IKeySignDto {
    @ApiProperty()
    @IsString()
    public message: string;
}


@Controller(`${CUSTODY_URL}/sign`)
export class CustodyKeySignController extends DefaultController<void, string> {
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

    @Post()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Body() params: KeySignDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<string> {
        let { company } = bearer.user;
        if (_.isNil(company)) {
            throw new CompanyNotFoundError();
        }
        let key = await this.transport.sendListen(new KeyGetByOwnerCommand(bearer.user.company.hlfUid));
        return this.transport.sendListen(new KeySignCommand({ uid: key.uid, message: params.message }))
    }
}
