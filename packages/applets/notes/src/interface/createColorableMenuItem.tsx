import React from "react";
import {
    Box,
    createCategoryMenuItemActionBindings,
    createStandardActionBindings,
    getHooked,
    IMenuItem,
    isItemSelectable,
    MenuItemFrame,
    MenuItemIcon,
    MenuItemLayout,
    ShortcutLabel,
    simpleSearchHandler,
    standardConnectionGroup,
    Truncated,
} from "@launchmenu/core";
import {useDataHook} from "model-react";
import {memo} from "react";
import Color from "color";
import {IColorableMenuItemData} from "./_types/IColorableMenuItemData";

/**
 * Creates a new colorable menu item
 * @param data The data to create a menu item with
 * @returns The menu item
 */
export function createColorableMenuItem({
    icon,
    color,
    rightAlignDescription,
    asCategory,
    ...bindingData
}: IColorableMenuItemData): IMenuItem {
    const {name, description, shortcut} = bindingData;
    const bindings = asCategory
        ? createCategoryMenuItemActionBindings(bindingData, asCategory)
        : createStandardActionBindings(bindingData, () => item);

    const item: IMenuItem = {
        view: memo(({highlight, ...props}) => {
            const {isCursor, isSelected} = props;

            const [h] = useDataHook();
            const iconV = getHooked(icon, h);
            const descriptionV = getHooked(description, h);
            const nameV = getHooked(name, h);
            let colorV = getHooked(color, h);
            if (colorV?.toLowerCase() == "#fff0") colorV = undefined; // Special exception to allow string based color skipping
            const colorData = new Color(colorV);
            const executableCategory = asCategory && isItemSelectable(props.item);
            return (
                <MenuItemFrame
                    outerProps={executableCategory ? {marginTop: "medium"} : undefined}
                    {...props}
                    colors={
                        colorV
                            ? {
                                  container: !isCursor ? {background: colorV} : undefined,
                                  selection: !isSelected
                                      ? {background: colorV}
                                      : undefined,
                                  border: colorData.isDark()
                                      ? colorData.lighten(0.1).toString()
                                      : colorData.darken(0.1).toString(),
                              }
                            : undefined
                    }>
                    <MenuItemLayout
                        icon={iconV && <MenuItemIcon icon={iconV} />}
                        name={
                            <Box
                                font="header"
                                css={{fontWeight: asCategory ? "bold" : undefined}}>
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
                                <Box
                                    textAlign={
                                        rightAlignDescription ? "right" : "inherit"
                                    }>
                                    <Truncated title={descriptionV}>
                                        <simpleSearchHandler.Highlighter
                                            query={highlight}
                                            pattern={bindingData.searchPattern}>
                                            {descriptionV}
                                        </simpleSearchHandler.Highlighter>
                                    </Truncated>
                                </Box>
                            )
                        }
                    />
                </MenuItemFrame>
            );
        }),
        actionBindings: bindings,
    };
    return item;
}
