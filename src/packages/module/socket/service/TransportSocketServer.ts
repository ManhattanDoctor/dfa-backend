import { WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@ts-core/common';
import { Socket } from 'socket.io';
import { SOCKET_NAMESPACE } from '@project/common/platform/api'
import { TransportSocketServer as CoreTransportSocketServer } from '@ts-core/socket-server';
import { TransportSocketUserId } from '@ts-core/socket-common';
import { RequestInvalidError } from '@project/module/core/middleware';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@WebSocketGateway({ namespace: SOCKET_NAMESPACE, cors: true })
export class TransportSocketServer extends CoreTransportSocketServer {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async getClientUserId(client: Socket): Promise<TransportSocketUserId> {
        let auth = client.handshake.auth;
        if (_.isNil(auth) || _.isNil(auth.token)) {
            throw new RequestInvalidError({ name: 'auth.token', value: auth.token, expected: 'not nil' });
        }
        // let { id } = await UserGuard.verifyToken(this.database, auth.token, false);
        // return id;
        return null;
    }
}