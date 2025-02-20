import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { IsDefined, MaxLength, ValidateNested, IsEnum, IsOptional, Length, IsNotEmpty, IsString, IsPhoneNumber, IsEmail, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { IUserEditDto, IUserEditDtoResponse } from '@project/common/platform/api/user';
import { User, UserPreferences, UserPreferencesLanguage, UserStatus, UserPreferencesTheme, USER_PREFERENCES_EMAIL_MAX_LENGTH, USER_PREFERENCES_NAME_MAX_LENGTH, USER_PREFERENCES_NAME_MIN_LENGTH, USER_PREFERENCES_PICTURE_MAX_LENGTH, USER_PREFERENCES_PHONE_MAX_LENGTH } from '@project/common/platform/user';
import { USER_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { Transform } from 'class-transformer';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard, Token } from '@project/module/openid';
import { ParseUtil } from '@project/module/util';
import { getResourceValidationOptions, ResourcePermission } from '@project/common/platform';
import { OpenIdService } from '@ts-core/openid-common';
import { TransportSocket } from '@ts-core/socket-server';
import { UserEditCommand } from '../transport';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

class UserPreferencesDto implements Partial<UserPreferences> {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @Length(USER_PREFERENCES_NAME_MIN_LENGTH, USER_PREFERENCES_NAME_MAX_LENGTH)
    public name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(UserPreferencesTheme)
    public theme?: UserPreferencesTheme;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsPhoneNumber()
    @MaxLength(USER_PREFERENCES_PHONE_MAX_LENGTH)
    public phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsEmail()
    @MaxLength(USER_PREFERENCES_EMAIL_MAX_LENGTH)
    public email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsUrl()
    @MaxLength(USER_PREFERENCES_PICTURE_MAX_LENGTH)
    public picture?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsNotEmpty()
    @IsEnum(UserPreferencesLanguage)
    public language?: UserPreferencesLanguage;
}

export class UserEditDto implements IUserEditDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(UserStatus)
    public status?: UserStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    @Type(() => UserPreferencesDto)
    @ValidateNested()
    public preferences?: UserPreferencesDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

@Controller(`${USER_URL}/:id`)
export class UserEditController extends DefaultController<IUserEditDto, IUserEditDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private socket: TransportSocket, private database: DatabaseService, private openId: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async validate(id: string, params: IUserEditDto, token: Token): Promise<void> {
        if (id === token.id && _.isNil(params.status)) {
            return;
        }
        await this.openId.validateResource(token.value, getResourceValidationOptions(ResourcePermission.USER_EDIT));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'User edit', response: User })
    @Put()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id') id: string, @Body() params: UserEditDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<IUserEditDtoResponse> {
        await this.validate(id, params, bearer.token);
        return this.transport.sendListen(new UserEditCommand(Object.assign(params, { id })));
    }
}
