import {IKeyInput} from "./IKeyInput";

/** The config for properties related to navigating to an item */
export type IItemNavigationConfig = {
    /** The base delay between key presses */
    delay?: number;
    /** The additional type delay variation */
    variation?: number;
    /** The name of the key to move the cursor down */
    downKey?: IKeyInput;
    /** The name of the key to move the cursor up */
    upKey?: IKeyInput;
};
