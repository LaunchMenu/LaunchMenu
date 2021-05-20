import {IKey, IUUID} from "@launchmenu/core";
import {IKeyBundleType} from "./IKeyBundleType";

/**
 * A type for a bundle of related key events
 */
export type IKeyBundle = {ID: IUUID; keys: IKey[]; type: IKeyBundleType};
