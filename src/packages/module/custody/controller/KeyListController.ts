import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, Paginable, IPaginable, IPagination, ITraceable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { DatabaseService } from '@project/module/database/service';
import { Key } from '@project/common/custody';
import { IOpenIdBearer, OpenIdBearer, OpenIdGuard, OpenIdOfflineValidation } from '@ts-core/backend-nestjs-openid';
import { Swagger } from '@project/module/swagger';
import { KeyEntity } from '../entity';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export interface IKeyListDto extends IPaginable<Key>, ITraceable { }

export interface IKeyListDtoResponse extends IPagination<Key> { }

class KeyListDto {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<Key>;

    @ApiPropertyOptional()
    sort?: FilterableSort<Key>;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiProperty({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/key')
export class KeyListController extends DefaultController<IKeyListDto, IKeyListDtoResponse> {
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

    @Swagger({ name: 'Get key list', response: null })
    @Get()
    @OpenIdOfflineValidation()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Query({ transform: Paginable.transform }) params: KeyListDto, @OpenIdBearer() bearer: IOpenIdBearer): Promise<IKeyListDtoResponse> {
        let query = KeyEntity.createQueryBuilder('key').where('key.owner = :owner', { owner: bearer.user.sub })
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: KeyEntity): Promise<Key> => item.toObject();

}
