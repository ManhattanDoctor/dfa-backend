import { Injectable } from '@nestjs/common';
import { Logger, ObjectUtil, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { ICompanyEditDto, CompanyEditCommand } from '../CompanyEditCommand';
import { DatabaseService } from '@project/module/database/service';
import { Company } from '@project/common/platform/company';
import { getSocketCompanyRoom, CompanyNotFoundError, CompanyUndefinedError } from '@project/common/platform';
import { TransportSocket } from '@ts-core/socket-server';
import { TRANSFORM_SINGLE } from '@project/module/core';
import { CompanyChangedEvent } from '@project/common/platform/transport';
import * as _ from 'lodash';

@Injectable()
export class CompanyEditHandler extends TransportCommandAsyncHandler<ICompanyEditDto, Company, CompanyEditCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private socket: TransportSocket, private database: DatabaseService) {
        super(logger, transport, CompanyEditCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private copyPartial<U>(from: Partial<U>, to: U): any {
        ObjectUtil.copyPartial(from, to, null, ObjectUtil.keys(from).filter(key => _.isUndefined(from[key])));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ICompanyEditDto): Promise<Company> {
        let { id } = params;
        if (_.isNil(id)) {
            throw new CompanyUndefinedError();
        }
        let item = await this.database.companyGet(id, true);
        if (_.isNil(item)) {
            throw new CompanyNotFoundError(id);
        }

        if (!_.isNil(params.status)) {
            item.status = params.status;
        }
        if (!_.isNil(params.hlfUid)) {
            item.hlfUid = params.hlfUid;
        }
        if (!_.isNil(params.preferences)) {
            this.copyPartial(params.preferences, item.preferences);
        }
        await item.save();

        let company = item.toObject({ groups: TRANSFORM_SINGLE });
        this.socket.dispatch(new CompanyChangedEvent(company), { room: getSocketCompanyRoom(id) });

        return company;
    }
}
