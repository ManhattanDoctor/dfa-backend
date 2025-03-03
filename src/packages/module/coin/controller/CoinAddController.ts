import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger, TraceUtil } from '@ts-core/common';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, Length, IsEnum, Matches, IsJSON, IsInt } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { COIN_URL } from '@project/common/platform/api';
import { ICoinAddDto, ICoinAddDtoResponse } from '@project/common/platform/api/coin';
import { Coin, CoinStatus, COIN_NAME_MIN_LENGTH, COIN_NAME_MAX_LENGTH } from '@project/common/platform/coin';
import { CoinEntity } from '@project/module/database/coin';
import { ParseUtil } from '@project/module/util';
import { OpenIdBearer, IOpenIdBearer, OpenIdGuard, OpenIdNeedResources } from '@project/module/openid';
import { getSocketUserRoom } from '@project/common/platform';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { TransportSocket } from '@ts-core/socket-server';
import { CoinAddedEvent } from '@project/common/platform/transport';
import { CoinSeries, CoinType, CoinUtil, ICoinSeries } from '@project/common/hlf/coin';
import { ICoinData } from '@project/common/hlf/coin/data';
import { ICoinPermission } from '@project/common/hlf/coin/permission';
import { OpenIdGetUserInfo } from '@ts-core/backend-nestjs-openid';
import { CompanyUtil } from '@project/common/platform/company';
import { ImageUtil } from '@project/common/platform/util';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CoinAddDto implements ICoinAddDto {
    @ApiProperty()
    @Transform(ParseUtil.inputString)
    @Length(COIN_NAME_MIN_LENGTH, COIN_NAME_MAX_LENGTH)
    public name: string;

    @ApiProperty()
    @IsEnum(CoinType)
    public type: CoinType;

    @ApiProperty()
    @Transform(ParseUtil.inputString)
    @Matches(CoinUtil.TICKER_REG_EXP)
    public ticker: string;

    @ApiProperty()
    @IsInt()
    public decimals: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsJSON()
    public data?: ICoinData;

    @ApiPropertyOptional()
    @IsOptional()
    @IsJSON()
    @Type(() => CoinSeries)
    public series?: ICoinSeries;

    @ApiPropertyOptional()
    @IsOptional()
    @IsJSON({ each: true })
    public permissions?: Array<ICoinPermission>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

@Controller(COIN_URL)
export class CoinAddController extends DefaultController<ICoinAddDto, ICoinAddDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private socket: TransportSocket) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Coin add', response: Coin })
    @Post()
    @OpenIdGetUserInfo()
    @OpenIdNeedResources()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Body() params: CoinAddDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<ICoinAddDtoResponse> {
        CompanyUtil.isCanCoinAdd(bearer.company, bearer.resources, true);

        let item = await CoinEntity.createEntity({
            name: params.name,
            type: params.type,
            data: params.data,
            ticker: params.ticker,
            series: params.series,
            status: CoinStatus.DRAFT,
            picture: ImageUtil.getCoin(TraceUtil.generate()),
            decimals: params.decimals,
            permissions: params.permissions,
            companyId: bearer.company.id
        }).save();

        let coin = item.toObject({ groups: TRANSFORM_SINGLE });
        this.socket.dispatch(new CoinAddedEvent(coin), { room: getSocketUserRoom(bearer.token.id) });

        return coin;
    }
}
