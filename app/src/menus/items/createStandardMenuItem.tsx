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
    onExecute,
    onSelect,
    onCursor,
    category,
    actionBindings = [],
}: IStandardMenuItemData): IMenuItem {
    let bindings: IActionBinding<any>[] = [
        createSimpleSearchBinding({name, description, tags}),
        ...actionBindings,
    ];
    if (onExecute) bindings.push(executeAction.createBinding(onExecute));
    if (onSelect) bindings.push(onSelectAction.createBinding(onSelect));
    if (onCursor) bindings.push(onCursorAction.createBinding(onCursor));
    if (category) bindings.push(getCategoryAction.createBinding(category));

    return {
        view: memo(({highlight, ...props}) => (
            <MenuItemFrame {...props} onExecute={onExecute}>
                <MenuItemLayout
                    icon={
                        icon &&
                        (typeof icon == "string" ? <MenuItemIcon icon={icon} /> : icon)
                    }
                    content={
                        <>
                            <SimpleSearchHighlight query={highlight}>
                                {name}
                            </SimpleSearchHighlight>
                            {description && (
                                <Truncated title={description}>
                                    <SimpleSearchHighlight query={highlight}>
                                        {description}
                                    </SimpleSearchHighlight>
                                </Truncated>
                            )}
                        </>
                    }
                />
            </MenuItemFrame>
        )),
        actionBindings: bindings,
    };
}
