import {useDataHook} from "model-react";
import React, {memo} from "react";
import {MenuItemFrame} from "../../../../components/items/MenuItemFrame";
import {getHooked} from "../../../../utils/subscribables/getHooked";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {IStandardMenuItemData} from "../../../items/_types/IStandardMenuItemData";
import {Box} from "../../../../styling/box/Box";
import {simpleSearchHandler} from "../../../../actions/types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {MenuItemLayout} from "../../../../components/items/MenuItemLayout";
import {MenuItemIcon} from "../../../../components/items/MenuItemIcon";
import {ShortcutLabel} from "../../../../components/items/ShortcutLabel";
import {Truncated} from "../../../../components/Truncated";
import {isItemSelectable} from "../../../items/isItemSelectable";
import {standardConnectionGroup} from "../../../../actions/types/connectionGroup/getConnectionGroupAction";
import {createCategoryMenuItemActionBindings} from "./createCategoryMenuItemActionBindings";
import {ICategory} from "../../../../actions/types/category/_types/ICategory";

/**
 * Creates an advanced menu item category
 * @param config The config for the menu item
 * @param getCategory Retrieves the category that this menu item will be for
 * @returns The created menu item
 */
export function createAdvancedCategoryMenuItem(
    {icon, ...bindingData}: IStandardMenuItemData,
    getCategory: () => ICategory
): IMenuItem {
    const {name, description, shortcut} = bindingData;
    const bindings = createCategoryMenuItemActionBindings(bindingData, getCategory, {
        connectionGroup: {
            top: undefined,
            bottom: standardConnectionGroup,
        },
    });

    const item: IMenuItem & {debugID: string} = {
        view: memo(({highlight, ...props}) => {
            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            const nameV = getHooked(name, h);

            const executable = isItemSelectable(props.item);
            return (
                <MenuItemFrame
                    {...props}
                    outerProps={executable ? {marginTop: "medium"} : undefined}
                    transparent={!executable}>
                    <MenuItemLayout
                        icon={iconV && <MenuItemIcon icon={iconV} />}
                        name={
                            <Box font="header" css={{fontWeight: "bold"}}>
                                <simpleSearchHandler.Highlighter
                                    query={highlight}
                                    pattern={bindingData.searchPattern}>
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
                                        pattern={bindingData.searchPattern}>
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
            return `AdvancedCategoryMenuItem: ${
                getHooked(name) +
                (getHooked(description) ? ", " + getHooked(description) : "")
            }`;
        },
    };
    return item;
}
