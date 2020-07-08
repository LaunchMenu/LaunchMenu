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

export function createStandardMenuItem({
    name,
    description,
    icon,
    onExecute,
    onSelect,
    onCursor,
    actionBindings = [],
}: IStandardMenuItemData): IMenuItem {
    let bindings: IActionBinding<any>[] = [
        ...actionBindings,
        executeAction.createBinding(onExecute),
    ];
    if (onSelect) bindings.push(onSelectAction.createBinding(onSelect));
    if (onCursor) bindings.push(onCursorAction.createBinding(onCursor));

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
