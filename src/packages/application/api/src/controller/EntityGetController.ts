import { Controller, Get, Param } from '@nestjs/common';
import { DefaultController, Cache } from '@ts-core/backend-nestjs';
import { Logger, ExtendedError, DateUtil, Sha512 } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { getType, ObjectType } from '@project/common/hlf';
import { ENTITY_URL } from '@project/common/platform/api';
import { IEntity, IEntityGetDtoResponse } from '@project/common/platform/api/entity';
import { CompanyEntity } from '@project/module/database/company';
import { CoinEntity } from '@project/module/database/coin';
import * as _ from 'lodash';

@Controller(`${ENTITY_URL}/:uid`)
export class EntityObjectGetController extends DefaultController<string, IEntityGetDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private cache: Cache) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getItem(uid: string): Promise<IEntity> {
        let type = getType(uid);
        if (type === ObjectType.USER) {
            let item = await CompanyEntity.createQueryBuilder('item').leftJoinAndSelect('item.preferences', 'preferences').where('item.hlfUid  = :uid', { uid }).getOne();
            return { id: item.id, name: item.preferences.name, picture: entityPicture(uid, { display: 'monsterid' }), type };
        }
        else if (type === ObjectType.COIN) {
            let item = await CoinEntity.createQueryBuilder('item').where('item.hlfUid  = :uid', { uid }).getOne();
            return { id: item.id, name: item.hlfUid, picture: entityPicture(uid, { display: 'retro' }), type };
        }
        throw new ExtendedError(`Unknown "${type}" type`);
    }

    private getCacheKey(uid: string): string {
        return `hldObject_${uid}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get hlf object', response: null })
    @Get()
    public async executeExtended(@Param('uid') uid: string): Promise<IEntityGetDtoResponse> {
        return this.cache.wrap<IEntity>(this.getCacheKey(uid), () => this.getItem(uid), DateUtil.MILLISECONDS_DAY);
    }
}


function entityPicture(uid: string, options: IEntityPicture): string {
    let { display, rating, size } = options;
    if (_.isNil(display)) {
        display = 'identicon';
    }
    if (_.isNil(rating)) {
        rating = 'g';
    }
    if (_.isNil(size)) {
        size = '200';
    }
    return `https://www.gravatar.com/avatar/${Sha512.hex(uid)}?s=${size}&d=${display}&r=${rating}`;
}

interface IEntityPicture {
    size?: string;
    rating?: string;
    display?: string;
}
