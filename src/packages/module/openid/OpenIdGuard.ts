import { OpenIdGuard as OpenIdGuardBase, IOpenIdBearer as IOpenIdBearerBase } from '@ts-core/backend-nestjs-openid';
import { IKeycloakTokenContent, IKeycloakTokenHeader, KeycloakAccessToken, OpenIdService } from '@ts-core/openid-common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '@project/module/database/service';
import { UserNotFoundError } from '@project/common/platform';
import { UserEntity } from '@project/module/database/user';
import * as _ from 'lodash';

@Injectable()
export class OpenIdGuard extends OpenIdGuardBase<Token, UserEntity> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(service: OpenIdService, reflector: Reflector, private database: DatabaseService) {
        super(service, reflector);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    protected async getToken(context: ExecutionContext, value: string): Promise<Token> {
        return new KeycloakAccessToken(value);
    }

    protected async getUserInfo(context: ExecutionContext, token: Token): Promise<UserEntity> {
        let item = await this.database.userGet(token.content.sub, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError();
        }
        return item;
    }
}

export interface IOpenIdBearer extends IOpenIdBearerBase<Token, UserEntity> { }

type Token = KeycloakAccessToken<IKeycloakTokenHeader, IKeycloakTokenContent>;
