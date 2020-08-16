import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";

/**
 * A context to get general IO utilities from
 */
export type IIOContext = {
    panes: {
        field: IViewStack;
        menu: IViewStack;
        content: IViewStack;
    };
    keyHandler: IKeyHandlerStack;
    undoRedo: IUndoRedoFacility;
    // TODO: add common/global settings
};

/**
 * A context to get general IO utilities from, if available
 */
export type IPartialIOContext = {
    panes?: Partial<IIOContext["panes"]>;
    keyHandler?: IKeyHandlerStack;
    undoRedo?: IUndoRedoFacility;
};
