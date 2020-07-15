import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {MenuItemFrame} from "./components/MenuItemFrame";
import {MenuItemIcon} from "./components/MenuItemIcon";
import {Truncated} from "../../components/Truncated";
import {MenuItemLayout} from "./components/MenuItemLayout";
import {executeAction} from "../actions/types/execute/executeAction";
import {onCursorAction} from "../actions/types/onCursor/onCursorAction";
import {onSelectAction} from "../actions/types/onSelect/onSelectAction";
import {getCategoryAction} from "../actions/types/category/getCategoryAction";

/**
 * Creates a new standard menu item
 * @param data The data to create a simple menu item with
 * @returns The menu item
 */
export function createStandardMenuItem({
    name,
    description,
    icon,
    onExecute,
    onSelect,
    onCursor,
    category,
    actionBindings = [],
}: IStandardMenuItemData): IMenuItem {
    let bindings: IActionBinding<any>[] = [...actionBindings];
    if (onExecute) bindings.push(executeAction.createBinding(onExecute));
    if (onSelect) bindings.push(onSelectAction.createBinding(onSelect));
    if (onCursor) bindings.push(onCursorAction.createBinding(onCursor));
    if (category) bindings.push(getCategoryAction.createBinding(category));

    return {
        view: memo(props => (
            <MenuItemFrame {...props} onExecute={onExecute}>
                <MenuItemLayout
                    icon={
                        icon &&
                        (typeof icon == "string" ? <MenuItemIcon icon={icon} /> : icon)
                    }
                    content={
                        <>
                            {name}
                            <Truncated title={description}>{description}</Truncated>
                        </>
                    }
                />
            </MenuItemFrame>
        )),
        actionBindings: bindings,
    };
}
