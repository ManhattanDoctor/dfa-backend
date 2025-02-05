import { DynamicModule } from '@nestjs/common';
import { LanguageModule as LanguageModuleBase } from '@ts-core/backend-nestjs-language';
import { LanguageProjects } from '@project/common/platform/language';
import { LanguageGetController } from './controller';
import * as _ from 'lodash';

export class LanguageModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(path: string): DynamicModule {
        return {
            module: LanguageModule,
            imports: [
                LanguageModuleBase.forRoot({ projects: LanguageProjects, path }),
            ],
            controllers: [LanguageGetController],
            global: true
        };
    }
}
