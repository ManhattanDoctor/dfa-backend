import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './service';

let providers = [DatabaseService];

@Module({
    imports: [TypeOrmModule],
    exports: providers,
    providers
})
export class DatabaseModule { }
