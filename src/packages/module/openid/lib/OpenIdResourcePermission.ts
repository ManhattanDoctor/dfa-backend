
import { SetMetadata, applyDecorators } from '@nestjs/common';
import { getResourceValidationOptions, Permission } from '@project/common/platform';
import { OpenIdGuard } from '@ts-core/backend-nestjs-openid';
import * as _ from 'lodash';

export const OpenIdResourcePermission = (permission: Permission) => {
    let { name, scope } = getResourceValidationOptions(permission);
    return applyDecorators(
        SetMetadata(OpenIdGuard.META_RESOURCE, name),
        SetMetadata(OpenIdGuard.META_RESOURCE_SCOPE, scope),
    );
}