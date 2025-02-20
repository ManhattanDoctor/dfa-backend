
import { SetMetadata, applyDecorators } from '@nestjs/common';
import { getResourceValidationOptions, ResourcePermission } from '@project/common/platform';
import { OpenIdGuard } from '@ts-core/backend-nestjs-openid';
import * as _ from 'lodash';

export const OpenIdResourcePermission = (item: ResourcePermission) => {
    let { name, scope } = getResourceValidationOptions(item);
    return applyDecorators(
        SetMetadata(OpenIdGuard.META_RESOURCE, name),
        SetMetadata(OpenIdGuard.META_RESOURCE_SCOPE, scope),
    );
}