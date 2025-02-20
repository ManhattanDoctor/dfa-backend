import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { TaxClient } from './TaxClient';
import { CompanyTaxDetails } from '@project/common/platform/company';
import * as _ from 'lodash';
import { CompanyTaxDetailsNotFoundError } from '@project/common/platform';

@Injectable()
export class TaxService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private client: TaxClient;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
        this.client = new TaxClient(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async getCompany(query: string): Promise<CompanyTaxDetails> {
        let item = await this.client.search(query);
        if (_.isNil(item)) {
            throw new CompanyTaxDetailsNotFoundError(query);
        }
        return item;
    }
}