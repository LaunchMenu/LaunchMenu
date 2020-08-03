import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {TDeepPartial} from "../../_types/TDeepPartial";

export type IIOContext = {
    panes: {
        field: IViewStack;
        menu: IViewStack;
        content: IViewStack;
    };
    keyHandler: IKeyHandlerStack;
    // TODO: add common/global settings
    // TODO: add undo/redo facility
};

export type IPartialIOContext = TDeepPartial<IIOContext>;
