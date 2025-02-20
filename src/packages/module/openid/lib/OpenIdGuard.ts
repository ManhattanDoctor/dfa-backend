import { OpenIdGuard as OpenIdGuardBase, IOpenIdBearer as IOpenIdBearerBase } from '@ts-core/backend-nestjs-openid';
import { IKeycloakTokenContent, IKeycloakTokenHeader, KeycloakAccessToken, OpenIdService } from '@ts-core/openid-common';
import { ExecutionContext, Injectable, SetMetadata, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '@project/module/database/service';
import { CompanyStatusInvalidError, CompanyUndefinedError, UserNotFoundError, UserStatusInvalidError } from '@project/common/platform';
import { UserEntity } from '@project/module/database/user';
import { IOpenIdAttributes } from './IOpenIdAttributes';
import { CompanyEntity } from '@project/module/database/company';
import { Company, CompanyStatus, CompanyUtil } from '@project/common/platform/company';
import { UserStatus } from '@project/common/platform/user';
import * as _ from 'lodash';

@Injectable()
export class OpenIdGuard extends OpenIdGuardBase<IOpenIdBearer, Token, UserEntity> {

    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static META_OPTIONS: string = 'options';

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static companyVerify(company: Company, options: IOpenIdGuardOptions): void {
        if (_.isNil(options) || _.isNil(options.company)) {
            return null;
        }
        if (_.isNil(company)) {
            throw new CompanyUndefinedError();
        }
        CompanyUtil.validateStatus(company, options.company.status, true);
    }


    public static getToken(value: string): Token {
        return new Token(value);
    }

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

    protected async getToken(context: ExecutionContext, bearer: IOpenIdBearer, value: string): Promise<Token> {
        return OpenIdGuard.getToken(value);
    }

    protected async getUserInfo(context: ExecutionContext, bearer: IOpenIdBearer, token: Token): Promise<UserEntity> {
        let item = await this.database.userGet(token.id, true);
        if (_.isNil(item)) {
            throw new UserNotFoundError(token.id);
        }
        if (item.status !== UserStatus.ACTIVE) {
            throw new UserStatusInvalidError({ expected: UserStatus.ACTIVE, value: item.status });
        }

        let { company } = item;
        OpenIdGuard.companyVerify(company, this.getOptions(context));
        bearer.company = company;
        return item;
    }

    protected getOptions(context: ExecutionContext): IOpenIdGuardOptions {
        let options = this.reflector.getAllAndOverride<IOpenIdGuardOptions>(OpenIdGuard.META_OPTIONS, [context.getClass(), context.getHandler()]);
        return options
    }
}

export interface IOpenIdBearer extends IOpenIdBearerBase<Token, UserEntity> {
    company?: CompanyEntity;
}

export interface IOpenIdGuardOptions {
    company?: {
        status?: CompanyStatus | Array<CompanyStatus>
    }
}

export const OpenIdBearer = createParamDecorator((data: unknown, context: ExecutionContext): IOpenIdBearer => {
    let request = <IOpenIdBearer>context.switchToHttp().getRequest();
    return { user: request.user, token: request.token, company: request.company }
})

export const OpenIdGuardOptions = (item: IOpenIdGuardOptions) => SetMetadata(OpenIdGuard.META_OPTIONS, item);

export interface ITokenHeader extends IKeycloakTokenHeader { }
export interface ITokenContent extends IOpenIdAttributes, IKeycloakTokenContent { }
export class Token extends KeycloakAccessToken<ITokenHeader, ITokenContent> {
    public get id(): string {
        return this.content.sub;
    }
}

