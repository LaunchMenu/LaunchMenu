import {IKeyName} from "../../keyIdentifiers/names";
import {IKeyId} from "../../keyIdentifiers/ids";

export type IKeyboardLayout = {
    /** The name of the keyboard */
    name: string;
    /** The key mapping on the keyboard, the code being event.which or `${event.which}-${event.location}`*/
    keys: {
        [code: string]: {
            /** The simple identifier of the key */
            readonly name: IKeyName;
            /** The full code */
            readonly id: IKeyId;
            /** The character handled by electron/chromium if left out*/
            readonly char?: string;
            /** The character when shift is pressed */
            readonly shiftChar?: string;
        };
    };
};
