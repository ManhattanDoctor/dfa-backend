import { TransformUtil, TransportCommandAsync } from '@ts-core/common';
import { Company, CompanyPreferences, CompanyStatus, CompanyTaxDetails } from '@project/common/platform/company';

export class CompanyEditCommand extends TransportCommandAsync<ICompanyEditDto, Company> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'CompanyEditCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyEditDto) {
        super(CompanyEditCommand.NAME, request);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(value: Company): Company {
        return TransformUtil.toClass(Company, value);
    }
}

export interface ICompanyEditDto {
    id: number;
    hlfUid?: string;
    status?: CompanyStatus;
    details?: CompanyTaxDetails;
    preferences?: Partial<CompanyPreferences>;
}