import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";

export type ISearchFieldPartialContext = {
    panes: {menu: IViewStack};
    keyHandler: IKeyHandlerStack;
    undoRedo: IUndoRedoFacility;
};
