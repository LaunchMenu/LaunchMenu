import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";

export type IIOContext = {
    panes: {
        field: IViewStack;
        menu: IViewStack;
        content: IViewStack;
    };
    keyHandler: IKeyHandlerStack;
    // TODO: add settings
};