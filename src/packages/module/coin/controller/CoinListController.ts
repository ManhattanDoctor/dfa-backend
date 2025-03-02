import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, Paginable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { ICoinListDto, ICoinListDtoResponse } from '@project/common/platform/api/coin';
import { Coin } from '@project/common/platform/coin';
import { COIN_URL } from '@project/common/platform/api';
import { CoinEntity } from '@project/module/database/coin';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import * as _ from 'lodash';
import { ResourcePermission } from '@project/common/platform';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class CoinListDto implements ICoinListDto {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<Coin>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<Coin>;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_SIZE })
    public pageSize: number;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_INDEX })
    public pageIndex: number;

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

@Controller(COIN_URL)
export class CoinListController extends DefaultController<ICoinListDto, ICoinListDtoResponse> {
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
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get coin list', response: null })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.COIN_LIST)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Query({ transform: Paginable.transform }) params: CoinListDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICoinListDtoResponse> {
        let query = CoinEntity.createQueryBuilder('coin');
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: CoinEntity): Promise<Coin> => item.toObject();
}
