import React, {memo} from "react";
import {IMenuItem} from "./_types/IMenuItem";
import {IStandardMenuItemData} from "./_types/IStandardMenuItemData";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";
import {getHooked} from "../../utils/subscribables/getHooked";
import {createStandardActionBindings} from "./createStandardActionBindings";
import {ShortcutLabel} from "../../components/items/ShortcutLabel";
import {useDataHook} from "model-react";
import {MenuItemDescription} from "../../components/items/MenuItemDescription";
import {MenuItemName} from "../../components/items/MenuItemName";

/**
 * Creates a new standard menu item
 * @param data The data to create a simple menu item with
 * @returns The menu item
 */
export function createStandardMenuItem({
    icon,
    TextHighlighter,
    ...bindingData
}: IStandardMenuItemData): IMenuItem {
    const {name, description, shortcut} = bindingData;
    const bindings = createStandardActionBindings(bindingData, () => item);

    const item: IMenuItem & {debugID: string} = {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            return (
                <MenuItemFrame {...props}>
                    <MenuItemLayout
                        icon={iconV && <MenuItemIcon icon={iconV} />}
                        name={
                            <MenuItemName
                                name={name}
                                searchPattern={bindingData.searchPattern}
                                query={highlight}
                                TextHighlighter={TextHighlighter}
                            />
                        }
                        shortcut={shortcut && <ShortcutLabel shortcut={shortcut} />}
                        description={
                            descriptionV && (
                                <MenuItemDescription
                                    description={descriptionV}
                                    searchPattern={bindingData.searchPattern}
                                    query={highlight}
                                    TextHighlighter={TextHighlighter}
                                />
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
