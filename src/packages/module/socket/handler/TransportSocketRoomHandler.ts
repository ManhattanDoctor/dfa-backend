import { Logger } from "@ts-core/common";
import { Injectable } from "@nestjs/common";
import { TransportSocketRoomAction, TransportSocketUserId } from "@ts-core/socket-common";
import { TransportSocketRoomHandler as CoreTransportSocketRoomHandler, ISocketUser, TransportSocket } from "@ts-core/socket-server";

@Injectable()
export class TransportSocketRoomHandler extends CoreTransportSocketRoomHandler {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportSocket) {
        super(logger, transport);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async check(name: string, user: ISocketUser<TransportSocketUserId>, action: TransportSocketRoomAction): Promise<void> {
        await super.check(name, user, action);
        if (action !== TransportSocketRoomAction.ADD) {
            return;
        }
        let client = this.transport.socket.getClient(user.clientId);
    }

}