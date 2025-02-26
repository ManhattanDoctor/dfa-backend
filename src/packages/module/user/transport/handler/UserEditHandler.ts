import { Injectable } from '@nestjs/common';
import { Logger, ObjectUtil, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { IUserEditDto, UserEditCommand } from '../UserEditCommand';
import { DatabaseService } from '@project/module/database/service';
import { User } from '@project/common/platform/user';
import { getSocketUserRoom, UserNotFoundError, UserUndefinedError } from '@project/common/platform';
import { TransportSocket } from '@ts-core/socket-server';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { UserChangedEvent } from '@project/common/platform/transport';
import { OpenIdSynchronizeCommand } from '@project/module/openid/transport';
import * as _ from 'lodash';

@Injectable()
export class UserEditHandler extends TransportCommandAsyncHandler<IUserEditDto, User, UserEditCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private socket: TransportSocket, private database: DatabaseService) {
        super(logger, transport, UserEditCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private copyPartial<U>(from: Partial<U>, to: U): any {
        ObjectUtil.copyPartial(from, to, null, ObjectUtil.keys(from).filter(key => _.isUndefined(from[key])));
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private isNeedOpenIdSynchronize(item: IUserEditDto): boolean {
        return !_.isNil(item.companyId) || !_.isNil(item.status);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IUserEditDto): Promise<User> {
        let { id } = params;
        if (_.isNil(id)) {
            throw new UserUndefinedError();
        }
        let item = await this.database.userGet(id, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError(id);
        }

        if (!_.isNil(params.status)) {
            item.status = params.status;
        }
        if (!_.isNil(params.companyId)) {
            item.companyId = params.companyId;
        }
        if (!_.isNil(params.preferences)) {
            this.copyPartial(params.preferences, item.preferences);
        }
        await item.save();

        let user = item.toObject({ groups: TRANSFORM_SINGLE });
        this.socket.dispatch(new UserChangedEvent(user), { room: getSocketUserRoom(id) });
        if (this.isNeedOpenIdSynchronize(params))
            await this.transport.sendListen(new OpenIdSynchronizeCommand(id));

        return user;
    }
}
