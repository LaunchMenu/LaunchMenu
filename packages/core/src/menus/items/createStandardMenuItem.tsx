import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {Truncated} from "../../components/Truncated";
import {executeAction} from "../actions/types/execute/executeAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {getCategoryAction} from "../actions/types/category/getCategoryAction";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {createSimpleSearchBinding} from "../actions/types/search/simpleSearch/simpleSearchHandler";
import {SimpleSearchHighlight} from "../../components/items/SimpleSearchHighlight";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {adjustBindings} from "./adjustBindings";
import {ISubscribableActionBindings} from "./_types/ISubscribableActionBindings";
import {getHooked} from "../../utils/subscribables/getHooked";
import {openMenuItemContentHandler} from "../actions/types/onCursor/openMenuItemContentHandler";
import {keyHandlerAction} from "../actions/types/keyHandler/keyHandlerAction";

/**
 * Creates a new standard menu item
 * @param data The data to create a simple menu item with
 * @returns The menu item
 */
export function createStandardMenuItem({
    name,
    description,
    tags,
    icon,
    category,
    shortcut, // TODO:
    content,
    searchPattern,
    actionBindings,
    onExecute,
    executePassively = false,
    onSelect,
    onCursor,
    onMenuChange,
}: IStandardMenuItemData): IMenuItem {
    const generatedBindings: IActionBinding<any>[] = [
        createSimpleSearchBinding({
            name,
            description,
            patternMatcher: searchPattern,
            tags,
        }),
    ];
    if (onExecute)
        generatedBindings.push(
            executeAction.createBinding({execute: onExecute, passive: executePassively})
        );
    if (onSelect) generatedBindings.push(onSelectAction.createBinding({onSelect}));
    if (onCursor) generatedBindings.push(onCursorAction.createBinding({onCursor}));
    if (onMenuChange)
        generatedBindings.push(onMenuChangeAction.createBinding({onMenuChange}));
    if (category) generatedBindings.push(getCategoryAction.createBinding(category));
    if (content)
        generatedBindings.push(openMenuItemContentHandler.createBinding(content));
    // TODO: implement once shortcut handler exists
    // if(shortcut) generatedBindings.push(keyHandlerAction.createBinding({onKey: (key, context)=>{

    // }}))

    // Combine the input action bindings with the created ones
    let bindings = generatedBindings as ISubscribableActionBindings;
    if (actionBindings)
        bindings = adjustBindings(actionBindings, actionBindings => [
            ...actionBindings,
            ...generatedBindings,
        ]);

    return {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const ico = getHooked(icon, h);
            const desc = getHooked(description, h);
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
                                    {getHooked(name, h)}
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
        actionBindings: bindings,
        get debugID(): string {
            return `StandardMenuItem: ${
                getHooked(name) +
                (getHooked(description) ? ", " + getHooked(description) : "")
            }`;
        },
    } as IMenuItem;
}
