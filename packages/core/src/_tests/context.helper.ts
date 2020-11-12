import {IIOContext} from "../context/_types/IIOContext";
import {SettingsContext} from "../settings/SettingsContext";
import {UndoRedoFacility} from "../undoRedo/UndoRedoFacility";

/**
 * A dummy context
 */
export const dummyContext: IIOContext = {
    close: () => Promise.resolve(),
    getUI: () => [],
    open: () => Promise.resolve(() => {}),
    undoRedo: new UndoRedoFacility(),
    settings: new SettingsContext(),
    contextMenuBindings: [],
};
