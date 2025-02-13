import { DynamicModule, OnApplicationBootstrap, Injectable } from '@nestjs/common';
import { CacheModule, LoggerModule, TransportModule, TransportType } from '@ts-core/backend-nestjs';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from '@project/module/database';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger, Transport } from '@ts-core/common';
import { IDatabaseSettings, ModeApplication } from '@ts-core/backend';
import { modulePath, nodeModulePath, nodeModulePathBuild } from '@project/module';
import { InitializeService } from './service';
import { HlfModule } from '@project/module/hlf';
import { UserModule } from '@project/module/user';
import { SocketModule } from '@project/module/socket';
import { OpenIdModule } from '@project/module/openid';
import { LoginModule } from '@project/module/login';
import { ThrottlerModule } from '@nestjs/throttler';
import { THROTTLE_DEFAULT } from '@project/module/core';
import { ConfigController, CustodyKeyGetController, CustodyKeySignController } from './controller';
import { LanguageModule } from '@project/module/language';
import { TaxModule } from '@project/module/tax';
import { CustodyModule } from '@project/module/custody';
import { CompanyModule } from '@project/module/company';

@Injectable()
export class AppModule extends ModeApplication<AppSettings> implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        let path = process.cwd();
        path = '/Users/renat.gubaev/Work/JS/dfa/backend';
        return {
            module: AppModule,
            imports: [
                DatabaseModule,
                CacheModule.forRoot(),
                LoggerModule.forRoot(settings),
                // LanguageModule.forRoot(`${path}/language`),
                TypeOrmModule.forRoot(this.getOrmConfig(settings)),
                TransportModule.forRoot({ type: TransportType.LOCAL }),
                ThrottlerModule.forRoot([THROTTLE_DEFAULT]),

                TaxModule,
                UserModule,
                LoginModule,
                SocketModule,
                CustodyModule,
                CompanyModule,

                HlfModule.forRoot(settings.hlf),
                OpenIdModule.forRoot(settings.keycloak)
            ],
            controllers: [
                ConfigController,
                CustodyKeyGetController,
                CustodyKeySignController
            ],
            providers: [
                {
                    provide: AppSettings,
                    useValue: settings
                },
                InitializeService,
            ]
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static getOrmConfig(settings: IDatabaseSettings): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: settings.databaseHost,
            port: settings.databasePort,
            username: settings.databaseUserName,
            password: settings.databaseUserPassword,
            database: settings.databaseName,

            synchronize: false,
            logging: false,
            entities: [
                `${modulePath()}/database/**/*Entity.{ts,js}`,
                `${nodeModulePath()}/@hlf-explorer/monitor/cjs/**/*Entity.{ts,js}`,
                `${nodeModulePathBuild()}/@hlf-explorer/monitor/cjs/**/*Entity.{ts,js}`,
                //
                `${modulePath()}/custody/**/*Entity.{ts,js}`,
            ],
            migrations: [
                __dirname + '/migration/*.{ts,js}',
                `${nodeModulePath()}/@hlf-explorer/monitor/cjs/**/*Migration.{ts,js}`,
                `${nodeModulePathBuild()}/@hlf-explorer/monitor/cjs/**/*Migration.{ts,js}`,
                //
                `${modulePath()}/custody/migration/*.{ts,js}`,
            ],
            migrationsRun: true
        }
    }


    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(logger: Logger, settings: AppSettings, private transport: Transport, private service: InitializeService) {
        super('DFA Platform API', settings, logger);
    }
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();
        if (this.settings.isTesting) {
            this.warn(`Service works in ${this.settings.mode}: some functions could work different way`);
        }
        await this.service.initialize();
    }
}
