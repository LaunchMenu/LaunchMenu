import React, {memo} from "react";
import {IFolderMenuItemData} from "./_types/IFolderMenuItemData";
import {IMenuItem} from "./_types/IMenuItem";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {executeAction} from "../actions/types/execute/executeAction";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";
import {getCategoryAction} from "../actions/types/category/getCategoryAction";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {SimpleSearchHighlight} from "../../components/items/SimpleSearchHighlight";
import {Truncated} from "../../components/Truncated";
import {IDataHook} from "model-react";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {createSimpleSearchBinding} from "../actions/types/search/simpleSearch/simpleSearchHandler";
import {openMenuExecuteHandler} from "../actions/types/execute/openMenuExecuteHandler";
import {ISubscribableActionBindings} from "./_types/ISubscribableActionBindings";
import {adjustBindings} from "./adjustBindings";
import {openMenuItemContentHandler} from "../actions/types/onCursor/openMenuItemContentHandler";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {shortcutHandler} from "../actions/types/keyHandler/shortcutHandler";
import {keyHandlerAction} from "../actions/types/keyHandler/keyHandlerAction";
import {forwardKeyEventHandler} from "../actions/types/keyHandler/forwardKeyEventHandler";
import {getHooked} from "../../utils/subscribables/getHooked";

/**
 * Retrieves the children in (subscribable) list form
 * @param children The children to get
 * @returns The children list
 */
export function getChildList<
    S extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]>
>(children: S): ISubscribable<IMenuItem[]> {
    return children instanceof Function || children instanceof Array
        ? (children as ISubscribable<IMenuItem[]>)
        : Object.values(children);
}

const get = <T extends unknown>(f: T, h?: IDataHook) =>
    f instanceof Function ? f(h) : f;

/**
 * Creates a new folder menu item, used to store multiple child menu items in
 * @param data The data to create the menu item from
 * @returns The folder menu item, including the children
 */
export function createFolderMenuItem<
    T extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]>,
    S extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]> = T
>({
    name,
    description,
    tags,
    icon,
    content,
    shortcut,
    category,
    actionBindings,
    children,
    closeOnExecute = false,
    forwardKeyEvents = false,
    searchPattern,
    searchChildren = (children as any) as S,
    onExecute,
    onSelect,
    onCursor,
    onMenuChange,
}: IFolderMenuItemData<T, S>): IMenuItem & {children: T} {
    const childList = getChildList(children);
    const generatedBindings: IActionBinding<any>[] = [
        createSimpleSearchBinding({
            name,
            description,
            tags,
            patternMatcher: searchPattern,
            children: getChildList(searchChildren),
        }),
    ];
    if (childList.length > 0 || childList instanceof Function)
        generatedBindings.push(
            openMenuExecuteHandler.createBinding({items: childList, closeOnExecute})
        );
    if (onExecute)
        generatedBindings.push(executeAction.createBinding({execute: onExecute}));
    if (onSelect) generatedBindings.push(onSelectAction.createBinding({onSelect}));
    if (onCursor) generatedBindings.push(onCursorAction.createBinding({onCursor}));
    if (onMenuChange)
        generatedBindings.push(onMenuChangeAction.createBinding({onMenuChange}));
    if (category) generatedBindings.push(getCategoryAction.createBinding(category));
    if (content)
        generatedBindings.push(openMenuItemContentHandler.createBinding(content));
    if (shortcut) generatedBindings.push(shortcutHandler.createBinding({shortcut}));
    if (forwardKeyEvents)
        generatedBindings.push(
            forwardKeyEventHandler.createBinding(h => ({
                targets: getHooked(childList, h),
            }))
        );

    // Combine the input action bindings with the created ones
    let bindings = generatedBindings as ISubscribableActionBindings;
    if (actionBindings)
        bindings = adjustBindings(actionBindings, actionBindings => [
            ...actionBindings,
            ...generatedBindings,
        ]);

    // TODO: add folder specific styling to indicate it's a folder
    return {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const ico = get(icon, h);
            const desc = get(description, h);
            return (
                <MenuItemFrame {...props}>
                    <MenuItemLayout
                        icon={
                            ico &&
                            (typeof ico == "string" ? <MenuItemIcon icon={ico} /> : ico)
                        }
                        content={
                            <>
                                <SimpleSearchHighlight query={highlight}>
                                    {get(name, h)}
                                </SimpleSearchHighlight>
                                {desc && (
                                    <Truncated title={desc}>
                                        <SimpleSearchHighlight query={highlight}>
                                            {desc}
                                        </SimpleSearchHighlight>
                                    </Truncated>
                                )}
                            </>
                        }
                    />
                </MenuItemFrame>
            );
        }),
        actionBindings: generatedBindings,
        children,
    };
}
