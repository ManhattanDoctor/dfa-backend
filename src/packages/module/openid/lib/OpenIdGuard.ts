import { OpenIdGuard as OpenIdGuardBase, IOpenIdBearer as IOpenIdBearerBase } from '@ts-core/backend-nestjs-openid';
import { OpenIdResources, OpenIdService } from '@ts-core/openid-common';
import { ExecutionContext, Injectable, SetMetadata, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OpenIdToken } from './OpenIdToken';
import { DatabaseService } from '@project/module/database/service';
import { UserEntity } from '@project/module/database/user';
import { CompanyEntity } from '@project/module/database/company';
import { Company } from '@project/common/platform/company';
import { User, UserStatus, UserUtil } from '@project/common/platform/user';
import * as _ from 'lodash';

@Injectable()
export class OpenIdGuard extends OpenIdGuardBase<IOpenIdBearer, OpenIdToken, UserEntity> {

    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static META_IS_NEED_RESOURCES: string = 'isNeedResources';

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static verifyUser(user: User): void {
        UserUtil.validateStatus(user, UserStatus.ACTIVE, true);
    }

    public static getToken(value: string): OpenIdToken {
        return new OpenIdToken(value);
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

    protected async getToken(context: ExecutionContext, bearer: IOpenIdBearer, value: string): Promise<OpenIdToken> {
        return OpenIdGuard.getToken(value);
    }

    protected async getUserInfo(context: ExecutionContext, bearer: IOpenIdBearer, token: OpenIdToken): Promise<UserEntity> {
        let item = await this.database.userGet(token.id, true);
        OpenIdGuard.verifyUser(item);
        return item;
    }

    protected async validationComplete(context: ExecutionContext, bearer: IOpenIdBearer, token: OpenIdToken): Promise<void> {
        let isNeedResources = this.reflector.getAllAndOverride<boolean>(OpenIdGuard.META_IS_NEED_RESOURCES, [context.getClass(), context.getHandler()]);
        if (isNeedResources) {
            bearer.resources = await this.service.getResources(token.value);
        }
    }
}

// --------------------------------------------------------------------------
//
//  Bearer
//
// --------------------------------------------------------------------------

export interface IOpenIdBearer extends IOpenIdBearerBase<OpenIdToken, UserEntity> {
    company?: CompanyEntity;
    resources?: OpenIdResources;
}

export interface IOpenIdAttributes {
    status?: UserStatus;
    company?: Pick<Company, 'id'>;
}

export const OpenIdBearer = createParamDecorator((data: unknown, context: ExecutionContext): IOpenIdBearer => {
    let request = <IOpenIdBearer>context.switchToHttp().getRequest();
    return { token: request.token, resources: request.resources, user: request.user, company: request.user?.company, };
})

// --------------------------------------------------------------------------
//
//  Decorators
//
// --------------------------------------------------------------------------

export const OpenIdNeedResources = () => SetMetadata(OpenIdGuard.META_IS_NEED_RESOURCES, true);