import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { Key } from '@project/common/custody';

export class KeyGetByOwnerCommand extends TransportCommandAsync<string, Key> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'KEY_GET_BY_OWNER';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: string) {
        super(KeyGetByOwnerCommand.NAME, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(value: Key): Key {
        return TransformUtil.toClass(Key, value);
    }
}