import { Company } from '@project/common/platform/company';
import * as _ from 'lodash';

export interface IOpenIdAttributes {
    company?: Pick<Company, 'id' | 'status'>
}