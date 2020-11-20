import React, {memo} from "react";
import {IFolderMenuItemData} from "./_types/IFolderMenuItemData";
import {IMenuItem} from "./_types/IMenuItem";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {SimpleSearchHighlight} from "../../components/items/SimpleSearchHighlight";
import {Truncated} from "../../components/Truncated";
import {IDataHook} from "model-react";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {adjustBindings} from "./adjustBindings";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {getHooked} from "../../utils/subscribables/getHooked";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {simpleSearchHandler} from "../../actions/types/search/simpleSearch/simpleSearchHandler";
import {openMenuExecuteHandler} from "../../actions/types/execute/openMenuExecuteHandler";
import {executeAction} from "../../actions/types/execute/executeAction";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangAction";
import {getContentAction} from "../../actions/types/content/getContentAction";
import {shortcutHandler} from "../../actions/types/keyHandler/shortcutHandler";
import {forwardKeyEventHandler} from "../../actions/types/keyHandler/forwardKeyEventHandler";
import {menuItemIdentityAction} from "../../actions/types/identity/menuItemIdentityAction";
import {createStandardActionBindings} from "./createStandardActionBindings";
import {Box} from "../../styling/box/Box";
import {ShortcutLabel} from "../../components/items/ShortcutLabel";
import {ThemeIcon} from "../../components/ThemeIcon";

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

/**
 * Creates a new folder menu item, used to store multiple child menu items in
 * @param data The data to create the menu item from
 * @returns The folder menu item, including the children
 */
export function createFolderMenuItem<
    T extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]>,
    S extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]> = T
>({
    actionBindings,
    children,
    closeOnExecute = false,
    forwardKeyEvents = false,
    searchChildren = (children as any) as S,
    name,
    pathName = getHooked(name),
    ...rest
}: IFolderMenuItemData<T, S>): IMenuItem & {children: T} {
    const childList = getChildList(children);
    const extraBindings: IActionBinding[] = [];
    if (childList.length > 0 || childList instanceof Function)
        extraBindings.push(
            openMenuExecuteHandler.createBinding({
                items: childList,
                closeOnExecute,
                pathName,
            })
        );
    if (forwardKeyEvents)
        extraBindings.push(
            forwardKeyEventHandler.createBinding({
                subscribableData: h => ({
                    targets: getHooked(childList, h),
                }),
            })
        );
    const bindings = createStandardActionBindings(
        {
            name,
            ...rest,
            actionBindings: adjustBindings(actionBindings ?? [], extraBindings),
            searchChildren: getChildList(searchChildren),
        },
        () => item
    );

    const {icon, description, shortcut} = rest;

    // TODO: add folder specific styling to indicate it's a folder
    const item: IMenuItem & {children: T} = {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            const nameV = getHooked(name, h);
            return (
                <MenuItemFrame {...props}>
                    <Box display="flex" alignItems="center">
                        <MenuItemLayout
                            icon={
                                iconV &&
                                (typeof iconV == "string" ? (
                                    <MenuItemIcon icon={iconV} />
                                ) : (
                                    iconV
                                ))
                            }
                            name={
                                <Box font="header">
                                    <SimpleSearchHighlight query={highlight}>
                                        {nameV}
                                    </SimpleSearchHighlight>
                                </Box>
                            }
                            shortcut={shortcut && <ShortcutLabel shortcut={shortcut} />}
                            description={
                                descriptionV && (
                                    <Truncated title={descriptionV}>
                                        <SimpleSearchHighlight query={highlight}>
                                            {descriptionV}
                                        </SimpleSearchHighlight>
                                    </Truncated>
                                )
                            }
                        />
                        <ThemeIcon icon="arrowRight" size={30} />
                    </Box>
                </MenuItemFrame>
            );
        }),
        actionBindings: bindings,
        children,
    };
    return item;
}
