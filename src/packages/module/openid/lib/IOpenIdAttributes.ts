import { Company } from '@project/common/platform/company';
import { UserStatus } from '@project/common/platform/user';
import * as _ from 'lodash';

export interface IOpenIdAttributes {
    status?: UserStatus;
    company?: Pick<Company, 'id'>;
}