import { Controller, Param, Get, UseGuards } from '@nestjs/common';
import { USER_URL } from '@project/common/platform/api';
import { User } from '@project/common/platform/user';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { IUserGetDtoResponse } from '@project/common/platform/api/user';
import { OpenIdGuard, OpenIdResourcePermission } from '@project/module/openid';
import { OpenIdService } from '@ts-core/openid-common';
import { UserNotFoundError } from '@project/common/platform';
import { ResourcePermission } from '@project/common/platform';
import { TRANSFORM_SINGLE } from '@project/module/core';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${USER_URL}/:id`)
export class UserGetController extends DefaultController<number, IUserGetDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService, private openId: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get user', response: User })
    @Get()
    @OpenIdResourcePermission(ResourcePermission.USER_READ)
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id') id: string): Promise<IUserGetDtoResponse> {
        let item = await this.database.userGet(id, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError(id);
        }
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
