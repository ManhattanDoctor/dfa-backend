
import { Controller, Param, Post } from '@nestjs/common';
import { OPEN_ID_LOGOUT_BY_REFRESH_TOKEN_URL } from '@project/common/platform/api';
import { OpenIdService } from '@ts-core/openid-common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_SLOW } from '@project/module/core';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${OPEN_ID_LOGOUT_BY_REFRESH_TOKEN_URL}/:token`)
export class OpenIdLogoutByRefreshTokenController {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private service: OpenIdService) { }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Throttle({ default: THROTTLE_SLOW })
    @Post()
    public async execute(@Param('token') token: string): Promise<void> {
        await this.service.logoutByRefreshToken(token);
    }
}
