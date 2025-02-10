import { Module, Global } from '@nestjs/common';
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
    exports: [TransportSocket],
    providers
})
export class SocketModule { }