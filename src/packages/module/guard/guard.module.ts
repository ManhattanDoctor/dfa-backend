import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';

@Module({
    imports: [DatabaseModule],
    // providers: [UserGuard]
})
export class GuardModule { }
