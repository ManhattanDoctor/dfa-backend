import { EventParser } from "../EventParser";
import { ActionType } from "@project/common/platform";
import { TransformUtil } from "@ts-core/common";
import { User } from "@project/common/hlf/user";
import { IUserAddDto, UserAddedEvent } from "@project/common/hlf/transport";
import * as _ from 'lodash';

export class UserAdded extends EventParser<UserAddedEvent, IUserAddDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let user = TransformUtil.toClass(User, this.data);

        let { initiatorUid } = this.request;
        let details = { userUid: user.uid, initiatorUid };
        this.actionAdd(ActionType.USER_ADDED, user.uid, details);
        this.actionAdd(ActionType.USER_ADDED, initiatorUid, details);
    }
}