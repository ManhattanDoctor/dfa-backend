import { EventParser } from "../EventParser";
import { ActionType } from "@project/common/platform";
import { IUserAddedEventDto } from "@project/common/hlf/transport";
import * as _ from 'lodash';

export class UserAdded extends EventParser<IUserAddedEventDto, void, void> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let { user, initiatorUid } = this.data;

        let details = { userUid: user.uid, initiatorUid };
        this.actionAdd(ActionType.USER_ADDED, user.uid, details);
        this.actionAdd(ActionType.USER_ADDED, initiatorUid, details);
    }
}