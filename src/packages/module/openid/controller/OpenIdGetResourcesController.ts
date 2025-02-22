
import { Body, Controller, Post } from '@nestjs/common';
import { OPEN_ID_GET_RESOURCES_URL } from '@project/common/platform/api';
import { IOpenIdResource, OpenIdService, OpenIdResourceValidationOptions } from '@ts-core/openid-common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_SLOW } from '@project/module/core';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export interface IOpenIdGetResourcesController {
    token: string;
    options?: OpenIdResourceValidationOptions;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(OPEN_ID_GET_RESOURCES_URL)
export class OpenIdGetResourcesController {
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
    public async execute(@Body() params: IOpenIdGetResourcesController): Promise<Array<IOpenIdResource>> {
        let item = await this.service.getResources(params.token, params.options);
        return Array.from(item.values());
    }
}
