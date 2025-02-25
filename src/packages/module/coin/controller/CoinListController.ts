import { Controller, Get, Query } from '@nestjs/common';
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
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class CoinListDto implements ICoinListDto {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<Coin>;

    @ApiPropertyOptional()
    sort?: FilterableSort<Coin>;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class CoinListDtoResponse implements ICoinListDtoResponse {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: Coin })
    items: Array<Coin>;
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

    @Swagger({ name: 'Get coin list', response: CoinListDtoResponse })
    @Get()
    public async executeExtended(@Query({ transform: Paginable.transform }) params: CoinListDto): Promise<ICoinListDtoResponse> {
        let query = CoinEntity.createQueryBuilder('coin');
        this.database.addCoinRelations(query);
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: CoinEntity): Promise<Coin> => item.toObject();
}
