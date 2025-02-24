import { Controller, Get, Param } from '@nestjs/common';
import { DefaultController, Cache } from '@ts-core/backend-nestjs';
import { Logger, ExtendedError, DateUtil } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { getType, ObjectType } from '@project/common/hlf';
import { HLF_OBJECT_URL } from '@project/common/platform/api';
import { IHlfObject, hlfObjectPicture } from '@project/common/platform/api/hlf';
import { IHlfObjectGetDtoResponse } from '@project/common/platform/api/hlf';
import { CompanyEntity } from '@project/module/database/company';
import { CoinEntity } from '@project/module/database/coin';
import * as _ from 'lodash';

@Controller(`${HLF_OBJECT_URL}/:uid`)
export class HlfObjectGetController extends DefaultController<string, IHlfObjectGetDtoResponse> {
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

    private async getItem(uid: string): Promise<IHlfObject> {
        let type = getType(uid);
        if (type === ObjectType.USER) {
            let item = await CompanyEntity.createQueryBuilder('item').leftJoinAndSelect('item.preferences', 'preferences').where('item.hlfUid  = :uid', { uid }).getOne();
            return { id: item.id, name: item.preferences.name, picture: hlfObjectPicture(uid, { display: 'monsterid' }), type };
        }
        else if (type === ObjectType.COIN) {
            let item = await CoinEntity.createQueryBuilder('item').where('item.hlfUid  = :uid', { uid }).getOne();
            return { id: item.id, name: item.hlfUid, picture: hlfObjectPicture(uid, { display: 'retro' }), type };
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
    public async executeExtended(@Param('uid') uid: string): Promise<IHlfObjectGetDtoResponse> {
        return this.cache.wrap<IHlfObject>(this.getCacheKey(uid), () => this.getItem(uid), DateUtil.MILLISECONDS_DAY);
    }
}
