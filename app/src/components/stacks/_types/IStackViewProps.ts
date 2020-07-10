import {IDataHook} from "model-react";
import {IStackItem} from "../../../stacks/_types/IStackItem";
import {IViewStackItem} from "../../../stacks/_types/IViewStackItem";
import {IChangeTransition} from "../transitions/change/_types/IChangeTransition";
import {ICloseTransition} from "../transitions/close/_types/ICloseTransition";
import {IOpenTransition} from "../transitions/open/_types/IOpenTransition";

export type IStackViewProps = {
    /** The items to visualize, with the last item to be on the top of the stack */
    items:
        | ((hook: IDataHook) => IStackItem<IViewStackItem>[])
        | {get: (hook: IDataHook) => IStackItem<IViewStackItem>[]}
        | IStackItem<IViewStackItem>[];
    /** Component takes no children, only items */
    children?: undefined;
    /** Whether to stop rendering items that are hidden, defaults to true */
    smartHide?: boolean;
    /** The opening transition type */
    OpenTransitionComp?: IOpenTransition;
    /** The changing transition type */
    ChangeTransitionComp?: IChangeTransition;
    /** The closing transition type */
    CloseTransitionComp?: ICloseTransition;
};
