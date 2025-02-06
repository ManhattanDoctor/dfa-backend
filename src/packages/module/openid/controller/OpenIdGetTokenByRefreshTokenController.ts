
import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { OPEN_ID_GET_TOKEN_BY_REFRESH_TOKEN_URL } from '@project/common/platform/api';
import { IOpenIdToken, KeycloakUtil, OpenIdService, OpenIdTokenUndefinedError } from '@ts-core/openid-common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_SLOW } from '@project/module/guard';
import { OpenIdBearer, OpenIdGuard, OpenIdSkipValidation } from '@ts-core/backend-nestjs-openid';
import { IOpenIdBearer } from '../OpenIdGuard';
import * as _ from 'lodash';
import { DatabaseService } from '@project/module/database/service';
import { UserStatus } from '@project/common/platform/user';
import { UserStatusForbiddenError } from '@project/common/hlf';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${OPEN_ID_GET_TOKEN_BY_REFRESH_TOKEN_URL}/:token`)
export class OpenIdGetTokenByRefreshTokenController {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private service: OpenIdService, private database: DatabaseService) { }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Throttle({ default: THROTTLE_SLOW })
    @Post()
    public async execute<T extends IOpenIdToken>(@Param('token') token: string): Promise<IOpenIdToken> {
        let item = await this.database.userGet(KeycloakUtil.getUserInfo(token).sub, false);
        if (item.status !== UserStatus.ACTIVE) {
            throw new UserStatusForbiddenError(item, { has: item.status, required: UserStatus.ACTIVE });
        }
        return this.service.getTokenByRefreshToken<T>(token);
    }
}
