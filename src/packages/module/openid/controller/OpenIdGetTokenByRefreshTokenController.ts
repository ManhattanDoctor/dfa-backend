
import { Controller, Param, Post } from '@nestjs/common';
import { OPEN_ID_GET_TOKEN_BY_REFRESH_TOKEN_URL } from '@project/common/platform/api';
import { IOpenIdTokenRefreshable, KeycloakUtil, OpenIdService } from '@ts-core/openid-common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_SLOW } from '@project/module/core';
import { DatabaseService } from '@project/module/database/service';
import { UserStatus } from '@project/common/platform/user';
import * as _ from 'lodash';
import { UserNotFoundError } from '@project/common/platform';
import { OpenIdGuard } from '../lib';

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
    public async execute<T extends IOpenIdTokenRefreshable>(@Param('token') token: string): Promise<T> {
        let item = await this.database.userGet(KeycloakUtil.getUserInfo(token).sub, false);
        OpenIdGuard.verifyUser(item);
        return this.service.getTokenByRefreshToken<T>(token);
    }
}
