import {IKeyPatternOptionMenuItemData} from "./IKeyPatternOptionMenuItemData";

export type IUpdateKeyPatternOptionExtrasExecuteData = IKeyPatternOptionMenuItemData & {
    /** Whether the field should update while editing */
    liveUpdate?: boolean;
} & (
        | {
              /** Whether the change action is undoable */
              undoable?: false;
          }
        | {
              /** Whether the change action is undoable */
              undoable?: true;
              /** Whether the field should update while editing */
              liveUpdate?: false;
          }
    );
