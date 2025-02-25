import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
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
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class CoinBalanceListDto implements ICoinBalanceListDto {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<CoinBalance>;

    @ApiPropertyOptional()
    sort?: FilterableSort<CoinBalance>;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class CoinBalanceListDtoResponse implements ICoinBalanceListDtoResponse {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: CoinBalance })
    items: Array<CoinBalance>;
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

    @Swagger({ name: 'Get coin balance list', response: CoinBalanceListDtoResponse })
    @Get()
    public async executeExtended(@Query({ transform: Paginable.transform }) params: CoinBalanceListDto): Promise<ICoinBalanceListDtoResponse> {
        let query = CoinBalanceEntity.createQueryBuilder('coinBalance');
        console.log(params);
        this.database.addCoinBalanceRelations(query);
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: CoinBalanceEntity): Promise<CoinBalance> => item.toObject();
}
