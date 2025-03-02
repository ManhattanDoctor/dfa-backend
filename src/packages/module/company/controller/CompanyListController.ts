import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Type } from 'class-transformer';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, Paginable, IFilterableProperties } from '@ts-core/common';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { Company, CompanyPreferences } from '@project/common/platform/company';
import { ICompanyListDto, ICompanyListDtoResponse } from '@project/common/platform/api/company';
import { CompanyEntity } from '@project/module/database/company';
import { COMPANY_URL } from '@project/common/platform/api';
import { TRANSFORM_LIST } from '@project/module/core';
import { OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { ResourcePermission } from '@project/common/platform';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

class CompanyListDto implements ICompanyListDto {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<Company>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<Company>;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => CompanyPreferencesFilterableProperties)
    @ValidateNested()
    public preferences?: IFilterableProperties<CompanyPreferences>;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_SIZE })
    public pageSize: number;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_INDEX })
    public pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

class CompanyPreferencesFilterableProperties implements IFilterableProperties<CompanyPreferences> {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<CompanyPreferences>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<CompanyPreferences>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(COMPANY_URL)
export class CompanyListController extends DefaultController<ICompanyListDto, ICompanyListDtoResponse> {
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
    //  Read Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get company list', response: null })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.COMPANY_LIST)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Query({ transform: Paginable.transform }) params: CompanyListDto): Promise<ICompanyListDtoResponse> {
        let query = CompanyEntity.createQueryBuilder('company');
        query.leftJoinAndSelect('company.preferences', 'companyPreferences');
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: CompanyEntity): Promise<Company> => item.toObject({ groups: TRANSFORM_LIST });
}
