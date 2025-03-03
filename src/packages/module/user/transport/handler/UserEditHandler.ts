import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { IUserEditDto, UserEditCommand } from '../UserEditCommand';
import { DatabaseService } from '@project/module/database/service';
import { User } from '@project/common/platform/user';
import { getSocketUserRoom, UserNotFoundError, UserUndefinedError } from '@project/common/platform';
import { TransportSocket } from '@ts-core/socket-server';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { UserChangedEvent } from '@project/common/platform/transport';
import { OpenIdSynchronizeCommand } from '@project/module/openid/transport';
import * as _ from 'lodash';
import { ObjectUtil } from '@project/common/platform/util';

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

        let isChanged = ObjectUtil.copy(params, item);
        if (ObjectUtil.copy(params.preferences, item.preferences)) {
            isChanged = true;
        }
        if (isChanged) {
            await item.save();
        }

        let value = item.toObject({ groups: TRANSFORM_SINGLE });
        if (isChanged) {
            this.socket.dispatch(new UserChangedEvent(value), { room: getSocketUserRoom(id) });
        }

        if (this.isNeedOpenIdSynchronize(params))
            await this.transport.sendListen(new OpenIdSynchronizeCommand(id));

        return value;
    }
}
