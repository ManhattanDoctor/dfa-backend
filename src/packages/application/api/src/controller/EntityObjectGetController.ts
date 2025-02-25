import { Controller, Get, Param } from '@nestjs/common';
import { DefaultController, Cache } from '@ts-core/backend-nestjs';
import { Logger, ExtendedError, DateUtil } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { getType, ObjectType } from '@project/common/hlf';
import { ENTITY_OBJECT_URL } from '@project/common/platform/api';
import { IEntityObject, IEntityObjectGetDtoResponse, entityObjectPicture } from '@project/common/platform/api/entity';
import { CompanyEntity } from '@project/module/database/company';
import { CoinEntity } from '@project/module/database/coin';
import * as _ from 'lodash';

@Controller(`${ENTITY_OBJECT_URL}/:uid`)
export class EntityObjectGetController extends DefaultController<string, IEntityObjectGetDtoResponse> {
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

    private async getItem(uid: string): Promise<IEntityObject> {
        let type = getType(uid);
        if (type === ObjectType.USER) {
            let item = await CompanyEntity.createQueryBuilder('item').leftJoinAndSelect('item.preferences', 'preferences').where('item.hlfUid  = :uid', { uid }).getOne();
            return { id: item.id, name: item.preferences.name, picture: entityObjectPicture(uid, { display: 'monsterid' }), type };
        }
        else if (type === ObjectType.COIN) {
            let item = await CoinEntity.createQueryBuilder('item').where('item.hlfUid  = :uid', { uid }).getOne();
            return { id: item.id, name: item.hlfUid, picture: entityObjectPicture(uid, { display: 'retro' }), type };
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
    public async executeExtended(@Param('uid') uid: string): Promise<IEntityObjectGetDtoResponse> {
        return this.cache.wrap<IEntityObject>(this.getCacheKey(uid), () => this.getItem(uid), DateUtil.MILLISECONDS_DAY);
    }
}
