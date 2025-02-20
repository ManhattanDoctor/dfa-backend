import { WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@ts-core/common';
import { SOCKET_NAMESPACE } from '@project/common/platform/api'
import { TransportSocketServer as CoreTransportSocketServer } from '@ts-core/socket-server';
import { TransportSocketUserId } from '@ts-core/socket-common';
import { OpenIdService, OpenIdTokenUndefinedError } from '@ts-core/openid-common';
import { Socket } from 'socket.io';
import { OpenIdGuard } from '@project/module/openid';
import * as _ from 'lodash';

@WebSocketGateway({ namespace: SOCKET_NAMESPACE, cors: true })
export class TransportSocketServer extends CoreTransportSocketServer {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private openId: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async getClientUserId(client: Socket): Promise<TransportSocketUserId> {
        let auth = client.handshake.auth;
        if (_.isNil(auth)) {
            throw new OpenIdTokenUndefinedError();
        }
        let { token } = auth;
        if (_.isNil(token)) {
            throw new OpenIdTokenUndefinedError();
        }
        await this.openId.validateToken(token, {});
        let { id } = client['token'] = OpenIdGuard.getToken(token);
        return id;
    }
}