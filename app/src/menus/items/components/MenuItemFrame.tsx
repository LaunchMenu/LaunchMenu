import React, {FC, useCallback} from "react";
import {Box} from "../../../styling/box/Box";
import {IMenu} from "../../menu/_types/IMenu";
import {IMenuItem} from "../_types/IMenuItem";

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
    <Box
        cursor="pointer"
        onClick={
            onExecute &&
            useCallback(() => {
                if (!menu || !item || menu.getCursor() == item) onExecute();
                else menu.setCursor(item);
            }, [onExecute, menu, item])
        }
        background={isCursor ? "primary" : isSelected ? "secondary" : "neutral5"}>
        {children}
    </Box>
);
