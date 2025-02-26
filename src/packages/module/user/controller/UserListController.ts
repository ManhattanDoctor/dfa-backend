import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Type } from 'class-transformer';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, Paginable, IFilterableProperties } from '@ts-core/common';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { User, UserPreferences } from '@project/common/platform/user';
import { IUserListDto, IUserListDtoResponse } from '@project/common/platform/api/user';
import { UserEntity } from '@project/module/database/user';
import { USER_URL } from '@project/common/platform/api';
import { TRANSFORM_LIST } from '@project/module/core';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import * as _ from 'lodash';
import { ResourcePermission } from '@project/common/platform';
import { DatabaseService } from '@project/module/database/service';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

class UserListDto implements IUserListDto {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<User>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<User>;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => UserPreferencesFilterableProperties)
    @ValidateNested()
    public preferences?: IFilterableProperties<UserPreferences>;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_SIZE })
    public pageSize: number;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_INDEX })
    public pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

class UserPreferencesFilterableProperties implements IFilterableProperties<UserPreferences> {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<UserPreferences>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<UserPreferences>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(USER_URL)
export class UserListController extends DefaultController<IUserListDto, IUserListDtoResponse> {
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
    //  Read Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get user list', response: null })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.USER_LIST)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Query({ transform: Paginable.transform }) params: UserListDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<IUserListDtoResponse> {
        let query = UserEntity.createQueryBuilder('user');
        if (!_.isNil(bearer.token.content.company)) {
            query.where('user.companyId  = :companyId', { companyId: bearer.token.content.company.id });
        }
        this.database.userRelationsAdd(query);
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: UserEntity): Promise<User> => item.toObject({ groups: TRANSFORM_LIST });
}
