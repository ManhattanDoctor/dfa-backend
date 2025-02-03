import { Injectable } from '@nestjs/common';
import { KeycloakToken, OpenIdService } from '@ts-core/backend-nestjs-openid';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { ILoginDto, ILoginDtoResponse } from '@project/common/platform/api/login';

@Injectable()
export class LoginService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private openid: OpenIdService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async checkBefore(token: string): Promise<void> {
        // let item = await UserEntity.findOneBy({ id: new KeycloakToken(token).getUserInfo().sub });
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async login(params: ILoginDto): Promise<ILoginDtoResponse> {
        console.log(params);
        let item = await this.openid.getTokenByCode({ code: params.data.codeOrToken, redirectUri: params.data.redirectUri });
        // await this.checkBefore(item.access_token);
        return { access: { token: item.access_token, expiresIn: item.expires_in, }, refresh: { token: item.refresh_token, expiresIn: item.refresh_expires_in } };
    }
}