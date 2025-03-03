import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger, Transport } from '@ts-core/common';
import { IsDefined, ValidateNested, IsOptional, Length, IsString, IsEnum, Matches, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ICoinEditDto, ICoinEditDtoResponse } from '@project/common/platform/api/coin';
import { Coin, COIN_NAME_MAX_LENGTH, COIN_NAME_MIN_LENGTH } from '@project/common/platform/coin';
import { COIN_URL } from '@project/common/platform/api';
import { Swagger } from '@project/module/swagger';
import { Transform } from 'class-transformer';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard, OpenIdNeedResources } from '@project/module/openid';
import { ParseUtil } from '@project/module/util';
import { CoinEditCommand } from '../transport';
import { CoinSeries, CoinType, CoinUtil as HlfCoinUtil } from '@project/common/hlf/coin';
import { ICoinData } from '@project/common/hlf/coin/data';
import { ICoinPermission } from '@project/common/hlf/coin/permission';
import { CoinUtil } from '@project/common/platform/coin';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CoinEditDto implements ICoinEditDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(ParseUtil.inputString)
    @Length(COIN_NAME_MIN_LENGTH, COIN_NAME_MAX_LENGTH)
    public name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(CoinType)
    public type?: CoinType;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(HlfCoinUtil.TICKER_REG_EXP)
    public ticker?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    public data?: ICoinData;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => CoinSeries)
    @ValidateNested()
    public series?: CoinSeries;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    public decimals?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    public permissions?: Array<ICoinPermission>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

@Controller(`${COIN_URL}/:id`)
export class CoinEditController extends DefaultController<ICoinEditDto, ICoinEditDtoResponse> {
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

    @Swagger({ name: 'Coin edit', response: Coin })
    @Put()
    @OpenIdGetUserInfo()
    @OpenIdNeedResources()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id', ParseIntPipe) id: number, @Body() params: CoinEditDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<Coin> {
        let item = await this.database.coinGet(id);
        CoinUtil.isCanEdit(bearer.company, item, bearer.resources, true);
        return this.transport.sendListen(new CoinEditCommand({
            id,
            name: params.name,
            type: params.type,
            data: params.data,
            series: params.series,
            ticker: params.ticker,
            decimals: params.decimals,
            permissions: params.permissions,
        }));
    }
}
