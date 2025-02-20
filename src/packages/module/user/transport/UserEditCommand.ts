import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { User, UserPreferences, UserStatus } from '@project/common/platform/user';

export class UserEditCommand extends TransportCommandAsync<IUserEditDto, User> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'UserEditCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserEditDto) {
        super(UserEditCommand.NAME, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(value: User): User {
        return TransformUtil.toClass(User, value);
    }
}

export interface IUserEditDto {
    id: string;
    status?: UserStatus;
    companyId?: number;
    preferences?: Partial<UserPreferences>;
}