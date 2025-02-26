import { ActionType } from "@project/common/platform";
import { CoinEdited } from "./CoinEdited";

export class CoinEmitted extends CoinEdited {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        this.type = ActionType.COIN_EMITTED;
        await super.execute();
    }
}