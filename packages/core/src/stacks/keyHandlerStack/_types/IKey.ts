import {IKeyId} from "../keyIdentifiers/ids";
import {IKeyName} from "../keyIdentifiers/names";

/**
 * An identifier object for keyboard keys
 */
export type IKey = {
    /** The ID of a key */
    readonly id: IKeyId;
    /** The name of a key */
    readonly name: IKeyName;
    /** The character of a key if any*/
    readonly char?: string;
};
