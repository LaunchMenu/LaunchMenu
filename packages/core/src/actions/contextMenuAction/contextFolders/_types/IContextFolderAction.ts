import {IAction} from "../../../_types/IAction";
import {IBindingCreator} from "../../../_types/IBindingCreator";
import {IContextMenuItemData} from "../../_types/IContextMenuItemData";

type IBindingCreatorObject = {
    createBinding: IBindingCreator<IContextMenuItemData, IContextMenuItemData[], any>;
};

/**
 * The interface that a context folder action should have
 */
export interface IContextFolderAction
    extends IAction<IContextMenuItemData, IContextMenuItemData[], any>,
        IBindingCreatorObject {}
