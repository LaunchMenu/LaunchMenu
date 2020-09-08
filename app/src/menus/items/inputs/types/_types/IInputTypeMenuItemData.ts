import {ISubscribable} from "../../../../../utils/subscribables/_types/ISubscribable";
import {ISubscribableActionBindings} from "../../../_types/ISubscribableActionBindings";

/**
 * Data for any input type menu item
 */
export type IInputTypeMenuItemData = {
    /** Whether to update the field as you type, defaults to false */
    liveUpdate?: boolean;
    /** Whether the change in value should be undoable, defaults to false, can't be used together with liveUpdate */
    undoable?: boolean;
    /** The name of the field */
    name: ISubscribable<string>;
    /** The description of the menu item */
    description?: ISubscribable<string>;
    /** The tags for the menu item */
    tags?: ISubscribable<string[]>;
    /** The extra action bindings */
    actionBindings?: ISubscribableActionBindings;
    /** Whether the field should be resetable to the initial value, defaults to false */
    resetable?: boolean;
    /** Whether the reset should be undoable, defaults to value of undoable */
    resetUndoable?: boolean;
};
