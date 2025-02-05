import { Controller, Get } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { Cache } from '@ts-core/backend-nestjs';
import { DateUtil, Logger, ObjectUtil } from '@ts-core/common';
import { CONFIG_URL } from '@project/common/platform/api';
import { IConfigDtoResponse } from '@project/common/platform/api/config';
import { AppSettings } from '../AppSettings';
import { Swagger } from '@project/module/swagger';
import { THROTTLE_FAST } from '@project/module/guard';
import { Throttle } from '@nestjs/throttler';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(CONFIG_URL)
export class ConfigController extends DefaultController<void, IConfigDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private cache: Cache, private settings: AppSettings) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getItem(): Promise<IConfigDtoResponse> {
        return {
            hlf: this.settings.hlf,
            keycloak: ObjectUtil.copyProperties(this.settings.keycloak, {}, ['url', 'realm', 'clientId', 'realmPublicKey'])
        }
    }

    private getCacheName(): string {
        return 'config';
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get config', response: null })
    @Get()
    @Throttle({ default: THROTTLE_FAST })
    public async execute(): Promise<IConfigDtoResponse> {
        return this.cache.wrap<IConfigDtoResponse>(this.getCacheName(), () => this.getItem(), 10 * DateUtil.MILLISECONDS_YEAR);
    }
}
