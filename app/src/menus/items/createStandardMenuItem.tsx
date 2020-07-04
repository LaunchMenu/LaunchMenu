import React from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {Box} from "../../styling/box/Box";
import {executeHandler} from "../actions/types/execute/executeHandler";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {onSelectHandler} from "../actions/types/onSelect/onSelectHandler";
import {onCursorHandler} from "../actions/types/onCursor/onCursorHandler";
import {IActionBinding} from "../actions/_types/IActionBinding";
import {MenuItemFrame} from "./components/MenuItemFrame";
import {MenuItemIcon} from "./components/MenuItemIcon";
import {Truncated} from "../../components/Truncated";

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
        view: ({isSelected, isCursor, item, menu}) => (
            <MenuItemFrame isSelected={isSelected} isCursor={isCursor}>
                <Box display="flex">
                    {icon &&
                        (typeof icon == "string" ? <MenuItemIcon icon={icon} /> : icon)}
                    <Box flexGrow={1}>
                        {name}
                        <Truncated title={description}>{description}</Truncated>
                    </Box>
                </Box>
            </MenuItemFrame>
        ),

        actionBindings: bindings,
    };
}
