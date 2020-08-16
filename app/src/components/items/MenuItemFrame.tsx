import React, {FC, useCallback} from "react";
import {Box} from "../../styling/box/Box";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";

/**
 * A menu item frame that visualizes selection state and click handler for item execution
 */
export const MenuItemFrame: FC<{
    isSelected: boolean;
    isCursor: boolean;
    menu?: IMenu;
    item?: IMenuItem;
    onExecute?: () => void;
}> = ({isCursor, isSelected, menu, item, onExecute, children}) => (
    <Box background={isSelected ? "secondary" : "bgPrimary"} paddingLeft="medium">
        <Box
            cursor="pointer"
            onClick={
                onExecute &&
                useCallback(() => {
                    if (!menu || !item || menu.getCursor() == item) onExecute();
                    else menu.setCursor(item);
                }, [onExecute, menu, item])
            }
            onContextMenu={() => console.log("detect")} // TODO: open context menu
            background={isCursor ? "primary" : "bgPrimary"}>
            {children}
        </Box>
    </Box>
);
