import { EventParser } from "../EventParser";
import { ActionType } from "@project/common/platform";
import { IUserEventDto } from "@project/common/hlf/transport";
import * as _ from 'lodash';

export class UserEdited extends EventParser<IUserEventDto, void, void> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let { userUid, initiatorUid } = this.data;

        let details = { userUid, initiatorUid };
        this.actionAdd(ActionType.USER_EDITED, userUid, details);
        this.actionAdd(ActionType.USER_EDITED, initiatorUid, details);
    }
}