import React, {FC, useCallback} from "react";
import {Box} from "../../styling/box/Box";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {isItemSelectable} from "../../menus/items/isItemSelectable";
import {useIOContext} from "../../context/react/useIOContext";
import {executeAction} from "../../menus/actions/types/execute/executeAction";
import {KeyEvent} from "../../stacks/keyHandlerStack/KeyEvent";

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
                    if (!menu || !item) return;
                    if (menu.getCursor() == item) {
                        if (ioContext) {
                            const cmd = await executeAction
                                .get([item])
                                .execute({context: menu.getContext()});
                            if (cmd) ioContext.undoRedo.execute(cmd);
                        }
                    } else if (isItemSelectable(item)) menu.setCursor(item);
                }, [ioContext, menu, item])}
                // Open the context menu on right click
                onContextMenu={() => {
                    if (!menu || !item) return;
                    if (isItemSelectable(item)) {
                        menu.setCursor(item);

                        // Use the context menu keyboard shortcut to open the menu
                        ioContext?.keyHandler.emit(
                            new KeyEvent({key: {id: "tab", name: "tab"}, type: "down"})
                        );
                        ioContext?.keyHandler.emit(
                            new KeyEvent({key: {id: "tab", name: "tab"}, type: "up"})
                        );
                    }
                }}
                background={isCursor ? "primary" : "bgPrimary"}>
                {children}
            </Box>
        </Box>
    );
};
