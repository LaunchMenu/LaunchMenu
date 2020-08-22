import React, {FC, useCallback} from "react";
import {Box} from "../../styling/box/Box";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {isItemSelectable} from "../../menus/items/isItemSelectable";
import {useIOContext} from "../../context/react/useIOContext";
import {executeAction} from "../../menus/actions/types/execute/executeAction";

/**
 * A menu item frame that visualizes selection state and click handler for item execution
 */
export const MenuItemFrame: FC<{
    isSelected: boolean;
    isCursor: boolean;
    menu?: IMenu;
    item?: IMenuItem;
}> = ({isCursor, isSelected, menu, item, children}) => {
    const ioContext = useIOContext();
    return (
        <Box background={isSelected ? "secondary" : "bgPrimary"} paddingLeft="medium">
            <Box
                cursor="pointer"
                onClick={useCallback(async () => {
                    if (!item) return;
                    if (!menu || menu.getCursor() == item) {
                        if (ioContext) {
                            const cmd = await executeAction.get([item]).execute();
                            if (cmd) ioContext.undoRedo.execute(cmd);
                        }
                    } else if (isItemSelectable(item)) menu.setCursor(item);
                }, [ioContext, menu, item])}
                onContextMenu={() => console.log("detect")} // TODO: open context menu
                background={isCursor ? "primary" : "bgPrimary"}>
                {children}
            </Box>
        </Box>
    );
};
