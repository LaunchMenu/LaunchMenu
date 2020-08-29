import {KeyPattern} from "../../../handlers/keyPattern/KeyPattern";
import {IActionBinding} from "../../../../../actions/_types/IActionBinding";

/** The input data to create a pattern menu item */
export type IKeyPatternMenuItemData = {
    /** The default value for the field */
    init: KeyPattern;
    /** Whether to update the field as you type, defaults to false */
    liveUpdate?: boolean;
    /** Whether the change in value should be undoable, defaults to false, can't be used together with liveUpdate */
    undoable?: boolean;
    /** The name of the field */
    name: string;
    /** The description of the menu item */
    description?: string;
    /** The tags for the menu item */
    tags?: string[];
    /** The extra action bindings */
    actionBindings?: IActionBinding<any>[];
    /** Whether the field should be resetable to the initial value, defaults to false */
    resetable?: boolean;
    /** Whether the reset should be undoable, defaults to value of undoable */
    resetUndoable?: boolean;
};
