import React, {memo} from "react";
import {IFolderMenuItemData} from "./_types/IFolderMenuItemData";
import {IMenuItem} from "./_types/IMenuItem";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {Truncated} from "../../components/Truncated";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {adjustBindings} from "./adjustBindings";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {getHooked} from "../../utils/subscribables/getHooked";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {openMenuExecuteHandler} from "../../actions/types/execute/openMenuExecuteHandler";
import {forwardKeyEventHandler} from "../../actions/types/keyHandler/forwardKeyEventHandler";
import {createStandardActionBindings} from "./createStandardActionBindings";
import {Box} from "../../styling/box/Box";
import {ShortcutLabel} from "../../components/items/ShortcutLabel";
import {ThemeIcon} from "../../components/ThemeIcon";
import {simpleSearchHandler} from "../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {IQuery} from "../menu/_types/IQuery";
import {IRecursiveSearchChildren} from "../../actions/types/search/tracedRecursiveSearch/_types/IRecursiveSearchChildren";
import { IDataHook } from "model-react";

/**
 * Retrieves the children in (subscribable) list form
 * @param children The children to get
 * @returns The children list
 */
export function getChildList<
    S extends {[key: string]: IMenuItem} | ((...args: any[])=>IMenuItem[]) | IMenuItem[], 
>(children: S): Exclude<S, {[key: string]: IMenuItem}> {
    return children instanceof Function || children instanceof Array
        ? children as any
        : Object.values(children);
}

/**
 * Creates a new folder menu item, used to store multiple child menu items in
 * @param data The data to create the menu item from
 * @returns The folder menu item, including the children
 */
export function createFolderMenuItem<
    T extends {[key: string]: IMenuItem} | ISubscribable<IMenuItem[]>,
    S extends {[key: string]: IMenuItem} | IRecursiveSearchChildren = T extends {[key: string]: IMenuItem} ? T : IRecursiveSearchChildren
>({
    actionBindings,
    children,
    closeOnExecute = false,
    forwardKeyEvents = false,
    searchChildren,
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

    if(!searchChildren) searchChildren = (children instanceof Function ? ((query: IQuery, hook?: IDataHook)=>(children as any)(hook)) : children as any) as S;
    const bindings = createStandardActionBindings(
        {
            name,
            ...rest,
            actionBindings: adjustBindings(actionBindings ?? [], extraBindings),
            searchChildren: getChildList(searchChildren),
            onShowChild: async ({parent, child, context}) => {
                if (parent)
                    return openMenuExecuteHandler
                        .get([parent])
                        .execute({context, focus: child});
            },
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
                                    <simpleSearchHandler.Highlighter
                                        query={highlight}
                                        pattern={rest.searchPattern}>
                                        {nameV}
                                    </simpleSearchHandler.Highlighter>
                                </Box>
                            }
                            shortcut={shortcut && <ShortcutLabel shortcut={shortcut} />}
                            description={
                                descriptionV && (
                                    <Truncated title={descriptionV}>
                                        <simpleSearchHandler.Highlighter
                                            query={highlight}
                                            pattern={rest.searchPattern}>
                                            {descriptionV}
                                        </simpleSearchHandler.Highlighter>
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
