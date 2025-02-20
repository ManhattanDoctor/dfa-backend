import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { IsDefined, MaxLength, ValidateNested, IsEnum, IsOptional, Length, IsString, IsPhoneNumber, IsEmail, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ICompanyEditDto, ICompanyEditDtoResponse } from '@project/common/platform/api/company';
import { Company, CompanyPreferences, CompanyStatus, COMPANY_PREFERENCES_EMAIL_MAX_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH, COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_PICTURE_MAX_LENGTH, COMPANY_PREFERENCES_PHONE_MAX_LENGTH, COMPANY_PREFERENCES_WEBSITE_MAX_LENGTH, COMPANY_PREFERENCES_ADDRESS_MAX_LENGTH, COMPANY_PREFERENCES_DESCRIPTION_MAX_LENGTH } from '@project/common/platform/company';
import { COMPANY_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { Transform } from 'class-transformer';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { ParseUtil } from '@project/module/util';
import { CompanyEditCommand } from '../transport';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

class CompanyPreferencesDto implements Partial<CompanyPreferences> {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @Length(COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH)
    public name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsPhoneNumber()
    @MaxLength(COMPANY_PREFERENCES_PHONE_MAX_LENGTH)
    public phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsEmail()
    @MaxLength(COMPANY_PREFERENCES_EMAIL_MAX_LENGTH)
    public email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsUrl()
    @MaxLength(COMPANY_PREFERENCES_PICTURE_MAX_LENGTH)
    public picture?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @IsUrl()
    @MaxLength(COMPANY_PREFERENCES_WEBSITE_MAX_LENGTH)
    public website?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @MaxLength(COMPANY_PREFERENCES_ADDRESS_MAX_LENGTH)
    public address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @MaxLength(COMPANY_PREFERENCES_DESCRIPTION_MAX_LENGTH)
    public description?: string;
}

export class CompanyEditDto implements ICompanyEditDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(CompanyStatus)
    public status?: CompanyStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    @Type(() => CompanyPreferencesDto)
    @ValidateNested()
    public preferences?: CompanyPreferencesDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

@Controller(`${COMPANY_URL}/:id`)
export class CompanyEditController extends DefaultController<ICompanyEditDto, ICompanyEditDtoResponse> {
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

    @Swagger({ name: 'Company edit', response: Company })
    @Put()
    // @OpenIdResourcePermission(ResourcePermission.COMPANY_EDIT)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @Body() params: CompanyEditDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICompanyEditDtoResponse> {
        return this.transport.sendListen(new CompanyEditCommand(Object.assign(params, { id })));
    }
}
