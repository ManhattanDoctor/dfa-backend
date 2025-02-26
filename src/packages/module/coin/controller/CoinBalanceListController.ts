import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, Paginable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { ICoinBalanceListDto, ICoinBalanceListDtoResponse } from '@project/common/platform/api/coin';
import { COIN_BALANCE_URL } from '@project/common/platform/api';
import { CoinBalanceEntity } from '@project/module/database/coin';
import { CoinBalance } from '@project/common/platform/coin';
import { OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { ResourcePermission } from '@project/common/platform';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class CoinBalanceListDto implements ICoinBalanceListDto {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<CoinBalance>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<CoinBalance>;

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

@Controller(COIN_BALANCE_URL)
export class CoinBalanceListController extends DefaultController<ICoinBalanceListDto, ICoinBalanceListDtoResponse> {
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

    @Swagger({ name: 'Get coin balance list', response: null })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.COIN_BALANCE_LIST)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Query({ transform: Paginable.transform }) params: CoinBalanceListDto): Promise<ICoinBalanceListDtoResponse> {
        let query = CoinBalanceEntity.createQueryBuilder('coinBalance');
        this.database.coinBalanceRelationsAdd(query);
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: CoinBalanceEntity): Promise<CoinBalance> => item.toObject();
}
