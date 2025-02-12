import { TransformFnParams } from 'class-transformer';
import * as _ from 'lodash';

export class ParseUtil {
    //--------------------------------------------------------------------------
    //
    // 	User Methods
    //
    //--------------------------------------------------------------------------

    public static inputString(itemOrParams: string | TransformFnParams, options?: ParseInputStringOptions): string {
        if (_.isNil(itemOrParams)) {
            return null;
        }

        let item: string = null;
        if (_.isObject(itemOrParams)) {
            item = itemOrParams.value;
        }
        else {
            item = itemOrParams;
        }

        if (_.isNil(item)) {
            return null;
        }

        item = item.toString();
        if (_.isNil(options)) {
            options = {};
        }
        if (!options.isDisableTrim) {
            item = _.trim(item);
        }
        if (!options.isDisableTagRemove) {
            item = item.replace(/<[^>]*>/g, '');
        }
        if (!options.isDisableNotAllowEmpty && _.isEmpty(item)) {
            return null;
        }
        return item;
    }

}

export interface ParseInputStringOptions {
    isDisableTrim?: boolean;
    isDisableTagRemove?: boolean;
    isDisableNotAllowEmpty?: boolean;
}
