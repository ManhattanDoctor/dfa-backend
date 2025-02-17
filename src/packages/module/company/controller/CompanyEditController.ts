import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { ObjectUtil, Logger } from '@ts-core/common';
import { IsDefined, MaxLength, ValidateNested, IsEnum, IsOptional, Length, IsString, IsPhoneNumber, IsEmail, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ICompanyEditDto, ICompanyEditDtoResponse } from '@project/common/platform/api/company';
import { Company, CompanyPreferences, CompanyStatus, COMPANY_PREFERENCES_EMAIL_MAX_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH, COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_PICTURE_MAX_LENGTH, COMPANY_PREFERENCES_PHONE_MAX_LENGTH, COMPANY_PREFERENCES_WEBSITE_MAX_LENGTH, COMPANY_PREFERENCES_ADDRESS_MAX_LENGTH, COMPANY_PREFERENCES_DESCRIPTION_MAX_LENGTH } from '@project/common/platform/company';
import { COMPANY_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { Transform } from 'class-transformer';
import { OpenIdBearer } from '@ts-core/backend-nestjs-openid';
import { IOpenIdBearer, OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { ParseUtil } from '@project/module/util';
import { ResourcePermission, CompanyNotFoundError } from '@project/common/platform';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { OpenIdService } from '@ts-core/openid-common';
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

    constructor(logger: Logger, private database: DatabaseService, private openId: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private copyPartial<U>(from: Partial<U>, to: U): any {
        ObjectUtil.copyPartial(from, to, null, ObjectUtil.keys(from).filter(key => _.isUndefined(from[key])));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Company edit', response: Company })
    @Put()
    @OpenIdResourcePermission(ResourcePermission.COMPANY_EDIT)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @Body() params: CompanyEditDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICompanyEditDtoResponse> {
        let item = await this.database.companyGet(id, true);
        if (_.isNil(item)) {
            throw new CompanyNotFoundError();
        }
        if (!_.isNil(params.status)) {
            item.status = params.status;
        }
        if (!_.isNil(params.preferences)) {
            this.copyPartial(params.preferences, item.preferences);
        }
        await item.save();

        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
