import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {executeHandler} from "../actions/types/execute/executeHandler";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {onSelectHandler} from "../actions/types/onSelect/onSelectHandler";
import {onCursorHandler} from "../actions/types/onCursor/onCursorHandler";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {MenuItemFrame} from "./components/MenuItemFrame";
import {MenuItemIcon} from "./components/MenuItemIcon";
import {Truncated} from "../../components/Truncated";
import {MenuItemLayout} from "./components/MenuItemLayout";

export function createStandardMenuItem({
    name,
    description,
    icon,
    onExecute,
    onSelect,
    onCursor,
}: IStandardMenuItemData): IMenuItem {
    let bindings: IActionBinding<any>[] = [executeHandler.createBinding(onExecute)];
    if (onSelect) bindings.push(onSelectHandler.createBinding(onSelect));
    if (onCursor) bindings.push(onCursorHandler.createBinding(onCursor));

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
