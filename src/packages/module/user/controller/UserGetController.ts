import { Controller, Req, Param, Get, UseGuards } from '@nestjs/common';
import { USER_URL } from '@project/common/platform/api';
import { User } from '@project/common/platform/user';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { IUserGetDtoResponse } from '@project/common/platform/api/user';
import { IOpenIdBearer, OpenIdGuard } from '@project/module/openid';
import { OpenIdBearer } from '@ts-core/backend-nestjs-openid';
import { OpenIdService } from '@ts-core/openid-common';
import { getResourceValidationOptions, ResourcePermission, UserNotFoundError } from '@project/common/platform';
import { TRANSFORM_ADMINISTRATOR, TRANSFORM_SINGLE } from '@project/module/core';
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
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async validate(id: string, bearer: IOpenIdBearer): Promise<void> {
        if (id !== bearer.token.content.sub) {
            await this.openId.validateResource(bearer.token.value, getResourceValidationOptions(ResourcePermission.USER_READ));
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get user', response: User })
    @Get()
    @UseGuards(OpenIdGuard)
    public async executeExtended(@Param('id') id: string, @OpenIdBearer() bearer: IOpenIdBearer): Promise<IUserGetDtoResponse> {
        await this.validate(id, bearer);

        let item = await this.database.userGet(id, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError();
        }
        return item.toObject({ groups: TRANSFORM_SINGLE });
    }
}
