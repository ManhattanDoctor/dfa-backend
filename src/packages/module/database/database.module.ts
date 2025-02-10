import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './service';

let providers = [DatabaseService];

@Global()
@Module({
    imports: [TypeOrmModule],
    exports: providers,
    providers
})
export class DatabaseModule { }
