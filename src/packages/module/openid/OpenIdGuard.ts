import { OpenIdGuard as OpenIdGuardBase, IOpenIdBearer as IOpenIdBearerBase } from '@ts-core/backend-nestjs-openid';
import { OpenIdService } from '@ts-core/openid-common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '@project/module/database/service';
import { UserNotFoundError } from '@project/common/platform';
import { User } from '@project/common/platform/user';
import * as _ from 'lodash';

@Injectable()
export class OpenIdGuard extends OpenIdGuardBase<User> {

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

    protected async getUserInfo(token: string): Promise<User> {
        let { sub } = await super.getUserInfo(token);
        let item = await this.database.userGet(sub, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError(item);
        }
        return item.toObject();
    }
}

export interface IOpenIdBearer extends IOpenIdBearerBase<User> { }
