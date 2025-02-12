import { OpenIdGuard as OpenIdGuardBase, IOpenIdBearer as IOpenIdBearerBase } from '@ts-core/backend-nestjs-openid';
import { OpenIdService } from '@ts-core/openid-common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '@project/module/database/service';
import { UserNotFoundError } from '@project/common/platform';
import { UserEntity } from '@project/module/database/user';
import * as _ from 'lodash';

@Injectable()
export class OpenIdGuard extends OpenIdGuardBase<UserEntity> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(service: OpenIdService, reflector: Reflector, private database: DatabaseService) {
        super(service, reflector);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    protected async getUserInfo(context: ExecutionContext, token: string): Promise<UserEntity> {
        let { sub } = await super.getUserInfo(context, token);
        let item = await this.database.userGet(sub, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError();
        }
        item.id = item.id;
        item.companyId = item.companyId;
        return item;
    }
}

export interface IOpenIdBearer extends IOpenIdBearerBase<UserEntity> {
    id: string;
    companyId: number;
}
