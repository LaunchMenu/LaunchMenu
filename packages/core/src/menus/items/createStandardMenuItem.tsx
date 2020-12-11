import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {Truncated} from "../../components/Truncated";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {getHooked} from "../../utils/subscribables/getHooked";
import {Box} from "../../styling/box/Box";
import {createStandardActionBindings} from "./createStandardActionBindings";
import {ShortcutLabel} from "../../components/items/ShortcutLabel";
import {simpleSearchHandler} from "../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";

/**
 * Creates a new standard menu item
 * @param data The data to create a simple menu item with
 * @returns The menu item
 */
export function createStandardMenuItem({
    icon,
    ...bindingData
}: IStandardMenuItemData): IMenuItem {
    const {name, description, shortcut} = bindingData;
    const bindings = createStandardActionBindings(bindingData, () => item);

    const item: IMenuItem & {debugID: string} = {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            const nameV = getHooked(name, h);
            return (
                <MenuItemFrame {...props}>
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
                                <simpleSearchHandler.Highlighter query={highlight}>
                                    {nameV}
                                </simpleSearchHandler.Highlighter>
                            </Box>
                        }
                        shortcut={shortcut && <ShortcutLabel shortcut={shortcut} />}
                        description={
                            descriptionV && (
                                <Truncated title={descriptionV}>
                                    <simpleSearchHandler.Highlighter query={highlight}>
                                        {descriptionV}
                                    </simpleSearchHandler.Highlighter>
                                </Truncated>
                            )
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
    };
    return item;
}
