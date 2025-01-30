import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { TransportSocket } from '@ts-core/socket-server';
import { TransportSocketServer, TransportSocketImpl } from './service';
import { TransportSocketRoomHandler } from './handler';

let providers = [
    TransportSocketImpl,
    {
        provide: TransportSocket,
        useExisting: TransportSocketImpl,
    },
    TransportSocketServer,
    TransportSocketRoomHandler
];

@Global()
@Module({
    imports: [DatabaseModule],
    exports: [TransportSocket],
    providers
})
export class SocketModule { }