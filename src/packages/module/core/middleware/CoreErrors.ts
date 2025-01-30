import { ErrorCode, IInvalidValueDto } from "@project/common/platform/api";
import { ExtendedError } from "@ts-core/common";
import { CoreExtendedError } from "./CoreExtendedError";



// --------------------------------------------------------------------------
//
//  Other
//
// --------------------------------------------------------------------------

export class RequestInvalidError<T> extends CoreExtendedError<IInvalidValueDto<T>> {
    constructor(details: IInvalidValueDto<T>, code: ErrorCode = ErrorCode.REQUEST_INVALID, status: number = ExtendedError.HTTP_CODE_BAD_REQUEST) {
        super(code, details, status);
    }
}