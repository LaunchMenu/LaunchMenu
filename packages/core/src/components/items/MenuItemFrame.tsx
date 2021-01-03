import React, {FC, useCallback} from "react";
import {Box} from "../../styling/box/Box";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {isItemSelectable} from "../../menus/items/isItemSelectable";
import {useIOContext} from "../../context/react/useIOContext";
import {KeyEvent} from "../../keyHandler/KeyEvent";
import {emitContextEvent} from "../../context/uiExtracters/emitContextEvent";
import {IItemExecuteCallback} from "../../actions/types/execute/_types/IItemExecuteCallback";
import {executeAction} from "../../actions/types/execute/executeAction";
import {useDataHook} from "../../utils/modelReact/useDataHook";
import {getConnectionGroupAction} from "../../actions/types/connectionGroup/getConnectionGroupAction";
import {useTheme} from "../../styling/theming/ThemeContext";
import {BackgroundColorProvider} from "../../styling/backgroundColorContext";

/**
 * A menu item frame that visualizes selection state and click handler for item execution
 */
export const MenuItemFrame: FC<{
    isSelected: boolean;
    isCursor: boolean;
    onExecute?: IItemExecuteCallback;
    menu?: IMenu;
    item?: IMenuItem;
    /** Whether to make the background transparent */
    transparent?: boolean;
}> = ({isCursor, isSelected, menu, onExecute, item, children, transparent}) => {
    const ioContext = useIOContext();

    const {connectBgPrevious, connectBgNext} = transparent
        ? ({} as IConnections)
        : useConnectAdjacent(menu, item);

    const radiusSize = "small";
    const standardBackground = transparent ? undefined : "bgPrimary";
    const mainBgColor = isCursor ? "primary" : standardBackground;
    return (
        <Box
            className="itemFrame"
            background={isSelected ? "secondary" : standardBackground}
            borderRadiusTopRight={connectBgPrevious ? undefined : radiusSize}
            borderRadiusBottomRight={connectBgNext ? undefined : radiusSize}
            borderRadiusTopLeft={connectBgPrevious ? undefined : radiusSize}
            borderRadiusBottomLeft={connectBgNext ? undefined : radiusSize}
            overflow="hidden"
            elevation={transparent ? undefined : "small"}
            zIndex={1}
            position="relative">
            <BackgroundColorProvider color={mainBgColor}>
                {connectBgPrevious && (
                    <Box
                        marginLeft="medium"
                        marginRight="medium"
                        borderTopColor="bgSecondary"
                        borderTopStyle="solid"
                        borderWidth={1}
                    />
                )}
                <Box
                    background={mainBgColor}
                    marginLeft="medium"
                    cursor="pointer"
                    onClick={useCallback(async () => {
                        if (!menu || !item) return;
                        if (menu.getCursor() == item) {
                            executeAction.execute(menu.getContext(), [item], onExecute);
                        } else if (isItemSelectable(item)) menu.setCursor(item);
                    }, [menu, item])}
                    // Open the context menu on right click
                    onContextMenu={() => {
                        if (!menu || !item) return;
                        if (isItemSelectable(item)) {
                            menu.setCursor(item);

                            // Use the context menu keyboard shortcut to open the menu
                            if (ioContext) {
                                emitContextEvent(
                                    ioContext,
                                    new KeyEvent({
                                        key: {id: "tab", name: "tab"},
                                        type: "down",
                                    })
                                );
                                emitContextEvent(
                                    ioContext,
                                    new KeyEvent({
                                        key: {id: "tab", name: "tab"},
                                        type: "up",
                                    })
                                );
                            }
                        }
                    }}>
                    {children}
                </Box>
            </BackgroundColorProvider>
        </Box>
    );
};

type IConnections = {
    connectBgPrevious?: boolean;
    connectBgNext?: boolean;
};

/**
 * Checks whether we should connect to adjacent items (concerning corner radii)
 * @param menu The menu that the item is in
 * @param item The item to check for
 * @returns Whether the previous and next items are selected
 */
export function useConnectAdjacent(menu?: IMenu, item?: IMenuItem): IConnections {
    if (!item || !menu) return {};

    const [h] = useDataHook();
    const cg = getConnectionGroupAction.get([item], h);
    if (cg.size == 0) return {};

    const items = menu.getItems(h);
    const index = items.indexOf(item);
    if (index == -1) return {};

    const previousItem = items[index - 1] as IMenuItem | undefined;
    const nextItem = items[index + 1] as IMenuItem | undefined;

    const previousGroups =
        previousItem && getConnectionGroupAction.get([previousItem], h);
    const nextGroups = nextItem && getConnectionGroupAction.get([nextItem], h);
    return {
        connectBgPrevious:
            previousGroups &&
            [...cg].reduce((cur, group) => cur || previousGroups.has(group), false),
        connectBgNext:
            nextGroups &&
            [...cg].reduce((cur, group) => cur || nextGroups.has(group), false),
    };
}
