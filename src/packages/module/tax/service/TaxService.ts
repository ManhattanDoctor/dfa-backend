import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { TaxClient } from './TaxClient';
import { CompanyTaxDetails } from '@project/common/platform/company';
import * as _ from 'lodash';

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
        return this.client.search(query);
    }
}