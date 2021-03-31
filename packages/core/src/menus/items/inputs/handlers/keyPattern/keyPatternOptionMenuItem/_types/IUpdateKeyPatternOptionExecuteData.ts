import {IKeyPatternOptionMenuItemData} from "./IKeyPatternOptionMenuItemData";

export type IUpdateKeyPatternOptionExecuteData = IKeyPatternOptionMenuItemData & {
    /** Whether the change action should be undoable */
    undoable?: boolean;
    /** Whether to insert the option if not found */
    insertIfDeleted?: boolean;
    /** Whether to only allow valid global shortcuts */
    globalShortcutOnly?: boolean;
};
