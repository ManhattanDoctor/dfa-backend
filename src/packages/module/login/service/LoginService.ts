import { Injectable } from '@nestjs/common';
import { KeycloakUtil, OpenIdService } from '@ts-core/openid-common';
import { Logger, LoggerWrapper, Transport } from '@ts-core/common';
import { ILoginDto, ILoginDtoResponse } from '@project/common/platform/api/login';
import { DatabaseService } from '@project/module/database/service';
import { UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserStatus } from '@project/common/platform/user';
import { OpenIdSynchronizeCommand } from '@project/module/openid/transport';

@Injectable()
export class LoginService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private openId: OpenIdService, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async addUserIfNeed(token: string): Promise<void> {
        let { sub, email, name } = await KeycloakUtil.getUserInfo(token);
        if (await UserEntity.existsBy({ id: sub })) {
            return;
        }
        let item = UserEntity.createEntity({ id: sub, login: email, status: UserStatus.ACTIVE });
        item.preferences = UserPreferencesEntity.createEntity({ name: name || email, email: email });
        await item.save();

        await this.transport.sendListen(new OpenIdSynchronizeCommand(item.id));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async login(params: ILoginDto): Promise<ILoginDtoResponse> {
        let item = await this.openId.getTokenByCode({ code: params.data.codeOrToken, redirectUri: params.data.redirectUri });
        await this.addUserIfNeed(item.access);
        return item;
    }
}