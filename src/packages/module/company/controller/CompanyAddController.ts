import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Transport, Logger } from '@ts-core/common';
import { Transform, Type } from 'class-transformer';
import { IsDefined, ValidateNested, IsOptional, IsString, Length, IsPhoneNumber, MaxLength, IsEmail, IsUrl } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { COMPANY_URL } from '@project/common/platform/api';
import { ICompanyAddDto, ICompanyAddDtoResponse } from '@project/common/platform/api/company';
import { Company, CompanyPreferences, CompanyStatus, COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH, COMPANY_PREFERENCES_PHONE_MAX_LENGTH, COMPANY_PREFERENCES_EMAIL_MAX_LENGTH, COMPANY_PREFERENCES_PICTURE_MAX_LENGTH, COMPANY_PREFERENCES_WEBSITE_MAX_LENGTH, COMPANY_PREFERENCES_ADDRESS_MAX_LENGTH, COMPANY_PREFERENCES_DESCRIPTION_MAX_LENGTH, CompanyTaxDetails } from '@project/common/platform/company';
import { CompanyEntity, CompanyPreferencesEntity } from '@project/module/database/company';
import { ParseUtil } from '@project/module/util';
import { IOpenIdBearer, OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { OpenIdBearer } from '@ts-core/backend-nestjs-openid';
import { ResourcePermission } from '@project/common/platform';
import { TRANSFORM_SINGLE } from '@project/module/core';
import * as _ from 'lodash';
import { UserEntity } from '@project/module/database/user';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

class CompanyPreferencesDto implements CompanyPreferences {
    @ApiProperty()
    @Transform(ParseUtil.inputString)
    @Length(COMPANY_PREFERENCES_NAME_MIN_LENGTH, COMPANY_PREFERENCES_NAME_MAX_LENGTH)
    public name: string;

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

export class CompanyAddDto implements ICompanyAddDto {
    @ApiProperty()
    @IsDefined()
    @Type(() => CompanyTaxDetails)
    @ValidateNested()
    public details: CompanyTaxDetails;

    @ApiProperty()
    @IsDefined()
    @Type(() => CompanyPreferencesDto)
    @ValidateNested()
    public preferences: CompanyPreferencesDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

@Controller(COMPANY_URL)
export class CompanyAddController extends DefaultController<ICompanyAddDto, ICompanyAddDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Company add', response: Company })
    @Post()
    @OpenIdResourcePermission(ResourcePermission.COMPANY_ADD)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Body() params: CompanyAddDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICompanyAddDtoResponse> {
        let item = CompanyEntity.createEntity({ status: CompanyStatus.DRAFT });
        item.details = params.details;
        item.preferences = CompanyPreferencesEntity.createEntity(params.preferences);

        await this.database.source.transaction(async manager => {
            await manager.getRepository(CompanyEntity).save(item);
            await manager.getRepository(UserEntity).update({ companyId: item.id }, { id: bearer.token.content.sub });
        });
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
