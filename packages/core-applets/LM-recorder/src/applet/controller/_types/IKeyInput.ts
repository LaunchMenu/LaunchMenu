import {IKey, IKeyName, KeyEvent} from "@launchmenu/core";

/** Input options for specifying a key event */
export type IKeyInput = KeyEvent | IKeyName | IKeyName[] | IKey[];
