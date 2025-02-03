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
import { SocketModule } from '@project/module/socket';
import { OpenIdModule } from '@project/module/openid';
import { LoginModule } from '@project/module/login';

@Injectable()
export class AppModule extends ModeApplication<AppSettings> implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [
                DatabaseModule,
                CacheModule.forRoot(),
                LoggerModule.forRoot(settings),
                TypeOrmModule.forRoot(this.getOrmConfig(settings)[0]),
                TransportModule.forRoot({ type: TransportType.LOCAL }),

                LoginModule,
                SocketModule,
                HlfModule.forRoot(settings.hlf),
                OpenIdModule.forRoot({ client: settings.keycloak, administrator: settings.keycloakAdministrator }),
            ],
            controllers: [

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

    public static getOrmConfig(settings: IDatabaseSettings): Array<TypeOrmModuleOptions> {
        return [
            {
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
                    `${nodeModulePathBuild()}/@hlf-explorer/monitor/cjs/**/*Entity.{ts,js}`
                ],
                migrations: [
                    __dirname + '/migration/*.{ts,js}',
                    `${nodeModulePath()}/@hlf-explorer/monitor/cjs/**/*Migration.{ts,js}`,
                    `${nodeModulePathBuild()}/@hlf-explorer/monitor/cjs/**/*Migration.{ts,js}`
                ],
                migrationsRun: true
            },
            {
                name: 'seed',
                type: 'postgres',
                host: settings.databaseHost,
                port: settings.databasePort,
                username: settings.databaseUserName,
                password: settings.databaseUserPassword,
                database: settings.databaseName,
                synchronize: false,
                logging: false,
                entities: [
                    `${modulePath()}/database/**/*Entity.{ts,js}`
                ],
                migrations: [__dirname + '/seed/*.{ts,js}'],
                migrationsRun: true,
                migrationsTableName: 'migrations_seed',
            }
        ];
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
