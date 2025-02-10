import { ILogger, TransformUtil, TransportHttp, ITransportHttpSettings } from '@ts-core/common';
import { CompanyTaxDetails } from '@project/common/platform/company';
import * as _ from 'lodash';

export class TaxClient extends TransportHttp<ITransportHttpSettings> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger) {
        super(logger, { method: 'get', baseURL: 'https://egrul.nalog.ru' });
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private parseDate(item: string): Date {
        if (_.isEmpty(item)) {
            return undefined;
        }
        let array = item.split('.');
        return array.length === 3 ? new Date(parseInt(array[2]), parseInt(array[1]) - 1, parseInt(array[0])) : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Auth Methods
    //
    // --------------------------------------------------------------------------

    public async search(value: string): Promise<CompanyTaxDetails> {
        let data = `query=${value}`;
        let { t } = await this.call('/',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Content-Length': data.length,
                    'Host': ''
                },
                method: 'post',
                data,
            });
        let item = await this.call(`search-result/${t}`);
        if (_.isEmpty(item.rows)) {
            return null;
        }
        item = _.first(item.rows);
        return TransformUtil.toClass(CompanyTaxDetails, {
            name: item.n,
            ceo: item.g,
            inn: item.i,
            kpp: item.p,
            ogrn: item.o,
            address: item.rn,
            closed: this.parseDate(item.e),
            founded: this.parseDate(item.r)
        });

    }
}
