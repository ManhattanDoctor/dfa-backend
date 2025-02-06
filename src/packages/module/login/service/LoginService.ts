import { Injectable } from '@nestjs/common';
import { IOpenIdToken, KeycloakUtil, OpenIdService } from '@ts-core/openid-common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { ILoginDto, ILoginDtoResponse } from '@project/common/platform/api/login';
import { DatabaseService } from '@project/module/database/service';
import { UserAccountEntity, UserEntity, UserPreferencesEntity, UserStatisticsEntity } from '@project/module/database/user';
import { UserAccountType, UserStatus } from '@project/common/platform/user';

@Injectable()
export class LoginService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private openId: OpenIdService, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async addUserIfNeed(token: IOpenIdToken): Promise<void> {
        let { sub, email } = await KeycloakUtil.getUserInfo(token.access_token);
        if (await UserEntity.existsBy({ id: sub })) {
            return;
        }
        let item = UserEntity.createEntity({ id: sub, login: email, status: UserStatus.ACTIVE });
        item.account = UserAccountEntity.createEntity(UserAccountType.UNDEFINED);
        item.statistics = UserStatisticsEntity.createEntity();
        item.preferences = UserPreferencesEntity.createEntity({ name: email, email: email });
        await item.save();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async login(params: ILoginDto): Promise<ILoginDtoResponse> {
        let item = await this.openId.getTokenByCode({ code: params.data.codeOrToken, redirectUri: params.data.redirectUri });
        await this.addUserIfNeed(item);
        return item;
    }
}