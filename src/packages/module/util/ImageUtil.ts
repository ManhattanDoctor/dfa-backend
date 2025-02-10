import { Sha512 } from "@ts-core/common";
import * as _ from "lodash";

export class ImageUtil {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static getAvatar(uid: string, extension?: string): string {
        if (_.isNil(extension)) {
            extension = 'svg';
        }
        uid = Sha512.hex(uid).substring(0, 32);
        // return `https://api.multiavatar.com/${uid}.${extension}`;
        return `https://www.gravatar.com/avatar/${Sha512.hex(uid)}?s=200&d=identicon&r=g`;
    }
}