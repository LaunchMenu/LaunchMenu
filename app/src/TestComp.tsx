import React, {FC, useState} from "react";
import {useTheme} from "./styling/theming/ThemeContext";
import {PrimaryButton} from "@fluentui/react";
import {Box} from "./styling/box/Box";
import {Truncated} from "./components/Truncated";
import {MenuItemIcon} from "./menus/items/components/MenuItemIcon";
import {createStandardMenuItem} from "./menus/items/createStandardMenuItem";
import {Menu} from "./menus/menu/Menu";
import {useDataHook} from "model-react";

const items = [
    createStandardMenuItem({
        name: "Bob",
        onExecute: () => alert("piss off, I am bob"),
    }),
    createStandardMenuItem({
        name: "John",
        icon:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvtk.org%2FWiki%2Fimages%2F0%2F03%2FVTK_Examples_Baseline_IO_TestReadTIFF.png",
        onExecute: () => alert("piss off, I am john"),
    }),
];
const menu = new Menu(items);

export const TestComp: FC = () => {
    const [h] = useDataHook();
    const items = menu.getItems(h);
    const selectedItems = menu.getSelected(h);
    const cursorItem = menu.getCursor(h);

    return (
        <Box>
            {items.map((menuItem, i) => (
                <menuItem.view
                    key={i}
                    isSelected={selectedItems.includes(menuItem)}
                    isCursor={cursorItem == menuItem}
                    menu={menu}
                    item={menuItem}
                />
            ))}
        </Box>
    );
};
