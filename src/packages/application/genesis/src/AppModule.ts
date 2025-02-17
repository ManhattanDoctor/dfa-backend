import { DynamicModule, OnApplicationBootstrap, Injectable } from '@nestjs/common';
import { LoggerModule, TransportModule, TransportType } from '@ts-core/backend-nestjs';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from '@project/module/database';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger, Transport } from '@ts-core/common';
import { IDatabaseSettings, ModeApplication } from '@ts-core/backend';
import { modulePath, nodeModulePath, nodeModulePathBuild } from '@project/module';
import { GenesisService } from './service';
import { CustodyModule } from '@project/module/custody';
import { DatabaseService } from '@project/module/database/service';

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
                LoggerModule.forRoot(settings),
                TypeOrmModule.forRoot(this.getOrmConfigMigration(settings)),
                TransportModule.forRoot({ type: TransportType.LOCAL }),

                CustodyModule,
            ],
            providers: [
                {
                    provide: AppSettings,
                    useValue: settings
                },
                {
                    provide: GenesisService,
                    inject: [Logger, Transport, DatabaseService],
                    useFactory: async (logger, transport, database) => new GenesisService(logger, transport, database, settings.hlf, settings.keycloak)
                },
            ]
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static getOrmConfigMigration(settings: IDatabaseSettings): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: settings.databaseHost,
            port: settings.databasePort,
            username: settings.databaseUserName,
            password: settings.databaseUserPassword,
            database: settings.databaseName,
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

    public static getOrmConfigSeed(settings: IDatabaseSettings): TypeOrmModuleOptions {
        return {
            name: 'seed',
            type: 'postgres',
            host: settings.databaseHost,
            port: settings.databasePort,
            username: settings.databaseUserName,
            password: settings.databaseUserPassword,
            database: settings.databaseName,
            entities: [
                `${modulePath()}/custody/**/*Entity.{ts,js}`,
                `${modulePath()}/database/**/*Entity.{ts,js}`
            ],
            migrations: [__dirname + '/seed/*.{ts,js}'],
            migrationsRun: true,
            migrationsTableName: 'migrations_seed',
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(logger: Logger, settings: AppSettings, private service: GenesisService) {
        super('DFA Genesis', settings, logger);
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
        await this.service.initialize(this.settings.keycloakLoginGenesis);
    }
}
