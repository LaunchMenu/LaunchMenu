import {IChangeTransition} from "../transitions/change/_types/IChangeTransition";
import {ICloseTransition} from "../transitions/close/_types/ICloseTransition";
import {IOpenTransition} from "../transitions/open/_types/IOpenTransition";
import {IDataHook} from "model-react";
import {IIdentifiedItem} from "../../../../_types/IIdentifiedItem";
import {IViewStackItem} from "../../../../uiLayers/_types/IViewStackItem";

export type IStackViewProps = {
    /** The stack of items to show */
    stackGetter: (h?: IDataHook) => IIdentifiedItem<IViewStackItem>[];
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
