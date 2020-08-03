import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";

export type ISearchFieldPartialContext = {
    panes: {menu: IViewStack};
    keyHandler: IKeyHandlerStack;
};
