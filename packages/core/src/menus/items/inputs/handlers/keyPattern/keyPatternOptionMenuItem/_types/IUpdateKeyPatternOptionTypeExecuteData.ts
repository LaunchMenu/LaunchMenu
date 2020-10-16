import {IKeyPatternOptionMenuItemData} from "./IKeyPatternOptionMenuItemData";

export type IUpdateKeyPatternOptionTypeExecuteData = IKeyPatternOptionMenuItemData & {
    /** Whether the field should update while editing */
    liveUpdate?: boolean;
    /** Whether the change action is undoable */
    undoable?: boolean;
};
