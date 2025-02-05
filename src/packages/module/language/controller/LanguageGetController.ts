import { Param, Controller, Query, Get } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { LanguageGetController as BaseLanguageGetController, LanguageGetDto } from '@ts-core/backend-nestjs-language';
import { Swagger } from '@project/module/swagger';
import { LANGUAGE_URL } from '@project/common/platform/api';
import { Cache } from '@ts-core/backend-nestjs';
import { LanguageProjects } from '@ts-core/language';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller()
export class LanguageGetController extends BaseLanguageGetController {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, cache: Cache, language: LanguageProjects) {
        super(logger, cache, language);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get project language', response: null })
    @Get(`${LANGUAGE_URL}/:project/:language`)
    public async get(@Param('project') project: string, @Param('language') language: string, @Query() params: LanguageGetDto): Promise<any> {
        return this.getRawTranslation(project, language, params.version);
    }
}
