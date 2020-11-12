import {IDataHook} from "model-react";
import {createStandardMenuItem} from "../../menus/items/createStandardMenuItem";
import {Priority} from "../../menus/menu/priority/Priority";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {createAction} from "../createAction";
import {executeAction} from "../types/execute/executeAction";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IBindingCreator} from "../_types/IBindingCreator";
import {TPureAction} from "../_types/TPureAction";
import {IContextFolderAction} from "./contextFolders/_types/IContextFolderAction";
import {contextMenuAction} from "./contextMenuAction";
import {IContextActionTransformer} from "./_types/IContextActionTransformer";
import {IContextItemData} from "./_types/IContextItemData";
import {IContextMenuItemData} from "./_types/IContextMenuItemData";

/**
 * Creates an action that conforms to all constraints of a proper action
 * @param actionInput The data to construct the action from
 * @returns The created action
 */
export function createContextAction<
    /** The input data type */
    I,
    /** The result data type */
    O = never,
    /** The parent actions types (union of parents) */
    P extends IAction = IAction<unknown, unknown, any>,
    /** The possible resulting bindings of this action */
    K extends IActionBinding<TPureAction<P>> = never,
    /** The folder to show the item in */
    F extends IContextFolderAction = typeof contextMenuAction,
    /** The create binding function, which may want to specify generic types for more elaborate interfaces */
    CB = IBindingCreator<I, O, P & TPureAction<F>>,
    /** The remaining functions specified on the object */
    EXTRAS = unknown
>(actionInput: {
    /** The name of the action */
    name: string;
    /** The parent actions of this action */
    parents?: P[];
    /** The core transformer of the action */
    core: IContextActionTransformer<I, O, K>;
    /** A custom binding creator in case generic types are needed */
    createBinding?: CB;
    /** The item to show in the context menu */
    contextItem?: IContextMenuItemData["item"] | IContextItemData;
    /**
     * The root action for which to override the context item, if all its bindings originate from this action.
     * Will automatically override any ancestor overrides too (overrides specified by our ancestors).
     */
    override?: IAction | null;
    /** Whether to prevent adding the count category to the item, defaults to false */
    preventCountCategory?: boolean;
    /** The folder that the action should appear in, defaults to the context menu (no folder) */
    folder?: F;
    /** Extra data to set on the created action */
    extras?: EXTRAS;
}): /** The action as well as an interface to create bindings for this action with */
IAction<I, O, P & TPureAction<F>> &
    EXTRAS & {
        createBinding: CB;
    } {
    const {
        name,
        parents,
        core,
        createBinding,
        contextItem,
        override: inpOverride,
        preventCountCategory,
        folder,
        extras: extra,
    } = actionInput;

    const targetMenu = (folder || contextMenuAction) as IContextFolderAction;

    // Get the action to override
    let override = inpOverride == null ? undefined : inpOverride;
    if (inpOverride == null && parents && parents.length == 1) {
        let ancestorAction = parents[0] as IAction;
        while (ancestorAction.parents && ancestorAction.parents.length == 1) {
            ancestorAction = ancestorAction.parents[0];
            if (ancestorAction.parents.find(({action}) => action == folder))
                override = ancestorAction;
        }
    }

    // Create the prioritized item if needed
    let item: IContextMenuItemData["item"];
    if (contextItem && (contextItem instanceof Function || "item" in contextItem)) {
        item = contextItem;
    } else {
        const {
            name: itemName = name,
            shortcut,
            actionBindings = [],
            icon,
            description,
            tags,
            priority = Priority.MEDIUM,
        } = contextItem ?? {};
        item = execute => ({
            item: createStandardMenuItem({
                name: itemName,
                shortcut,
                icon,
                description,
                tags,
                actionBindings: execute ? [...actionBindings, execute] : actionBindings,
            }),
            priority,
        });
    }

    // Create the action
    const action = {
        ...createAction({
            name,
            parents: parents ? [...parents, targetMenu] : [targetMenu],
            createBinding,
            core: (bindingData: I[], indices: number[], hook: IDataHook) => {
                const {execute, result, children} = core(bindingData, indices, hook);
                const executeBinding =
                    execute &&
                    ("action" in execute
                        ? execute
                        : executeAction.createBinding(execute));
                const contextItem = targetMenu.createBinding({
                    item,
                    override,
                    preventCountCategory,
                    execute: executeBinding,
                    action,
                });
                return {
                    result,
                    children: children ? [...children, contextItem] : [contextItem],
                };
            },
        }),
        ...extra,
    };
    return action as any;
}
