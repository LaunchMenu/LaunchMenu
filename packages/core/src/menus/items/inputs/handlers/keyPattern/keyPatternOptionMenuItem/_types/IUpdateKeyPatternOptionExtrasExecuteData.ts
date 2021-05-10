import {IKeyPatternOptionMenuItemData} from "./IKeyPatternOptionMenuItemData";

export type IUpdateKeyPatternOptionExtrasExecuteData = IKeyPatternOptionMenuItemData & {
    /** Whether the field should update while editing */
    liveUpdate?: boolean;
    /** Whether the change action is undoable, not combinable with live update*/
    undoable?: boolean;
    /** Whether to only allow valid global shortcuts */
    globalShortcut?: boolean;
};
