import {IIOContext} from "../context/_types/IIOContext";
import {SettingsContext} from "../settings/SettingsContext";
import {UndoRedoFacility} from "../undoRedo/UndoRedoFacility";

/**
 * A dummy context
 */
export const context: IIOContext = {
    keyHandler: null as any,
    panes: {content: null as any, field: null as any, menu: null as any},
    undoRedo: new UndoRedoFacility(),
    settings: new SettingsContext(),
    contextMenuItems: [],
};
