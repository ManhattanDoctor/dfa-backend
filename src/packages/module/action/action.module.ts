import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { ActionListController } from './controller';

@Module({
    imports: [DatabaseModule],
    controllers: [
        ActionListController,
    ]
})
export class ActionModule { }