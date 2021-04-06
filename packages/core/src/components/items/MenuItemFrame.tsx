import React, {FC, useCallback, useEffect, useMemo, useRef} from "react";
import {Box} from "../../styling/box/Box";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {isItemSelectable} from "../../menus/items/isItemSelectable";
import {useIOContext} from "../../context/react/useIOContext";
import {KeyEvent} from "../../keyHandler/KeyEvent";
import {emitContextEvent} from "../../context/uiExtracters/emitContextEvent";
import {executeAction} from "../../actions/types/execute/executeAction";
import {getConnectionGroupAction} from "../../actions/types/connectionGroup/getConnectionGroupAction";
import {BackgroundColorProvider} from "../../styling/backgroundColorContext";
import {useDataHook} from "model-react";
import {IMenuItemFrameProps} from "./_types/IMenuItemFrameProps";
import {mergeStyles} from "../../utils/mergeStyles";
import Color from "color";
import {IThemeColor} from "../../styling/theming/_types/IBaseTheme";
import {useTheme} from "../../styling/theming/ThemeContext";
import {useIsItemSelectable} from "./useIsItemSelectable";

/**
 * A menu item frame that visualizes selection state and click handler for item execution
 */
export const MenuItemFrame: FC<IMenuItemFrameProps> = ({
    isCursor,
    isSelected,
    menu,
    onExecute,
    item,
    children,
    transparent,
    disabled,
    outerProps,
    innerProps,
    colors,
}) => {
    const ioContext = useIOContext();

    const onContextMenu = useCallback(() => {
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
    }, [menu, item]);

    const isSelectable = useIsItemSelectable(item);
    if (disabled == undefined && !transparent) disabled = !isSelectable;
    const {connectBgPrevious, connectBgNext} = transparent
        ? ({} as IConnections)
        : useConnectAdjacent(menu, item);

    const radiusSize = "small";
    const standardBackground = transparent ? undefined : "bgPrimary";
    const mainBgColor = isCursor ? "primary" : standardBackground;

    // Compute the main background color
    const theme = useTheme();
    const containerBgColor =
        colors?.container?.background ?? (mainBgColor && theme.color[mainBgColor]);

    const textColor = useMemo((): IThemeColor => {
        if (!containerBgColor) return "fontBgPrimary";
        const isDark = new Color(containerBgColor).isDark();
        return isDark ? "fontPrimary" : "fontBgPrimary";
    }, [containerBgColor]);

    return (
        <Box
            className="itemFrame"
            background={isSelected ? "secondary" : standardBackground}
            borderRadiusTopRight={connectBgPrevious ? undefined : radiusSize}
            borderRadiusBottomRight={connectBgNext ? undefined : radiusSize}
            borderRadiusTopLeft={connectBgPrevious ? undefined : radiusSize}
            borderRadiusBottomLeft={connectBgNext ? undefined : radiusSize}
            opacity={disabled ? 0.5 : 1}
            overflow="hidden"
            elevation={transparent ? undefined : "small"}
            zIndex={1}
            // Possible ui customization
            {...outerProps}
            css={mergeStyles(colors?.selection, outerProps?.css)}
            position="relative">
            <BackgroundColorProvider color={containerBgColor}>
                <Box
                    background={mainBgColor}
                    color={textColor}
                    marginLeft="medium"
                    cursor={transparent || disabled ? "default" : "pointer"}
                    onClick={useCallback(async () => {
                        if (!menu || !item) return;
                        if (menu.getCursor() == item) {
                            executeAction.execute(menu.getContext(), [item], onExecute);
                        } else if (!disabled && isSelectable) menu.setCursor(item);
                    }, [menu, item])}
                    // Open the context menu on right click
                    onContextMenu={onContextMenu}
                    // Possible ui customization
                    {...innerProps}
                    css={mergeStyles(colors?.container, innerProps?.css)}>
                    {connectBgPrevious && (
                        <Box
                            marginLeft="medium"
                            marginRight="medium"
                            borderTopColor={isCursor ? "primary" : "bgTertiary"}
                            css={
                                isCursor
                                    ? {borderTopColor: "transparent"}
                                    : colors?.border
                                    ? {borderTopColor: colors.border}
                                    : undefined
                            }
                            borderTopStyle="solid"
                            borderWidth={1}
                        />
                    )}
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
    let prev = useRef<IConnections>({});
    const [h] = useDataHook();
    if (!item || !menu) return {};

    const items = menu.getItems(h);
    const index = items.indexOf(item);
    if (index == -1) return prev.current;

    const connect = getConnectionGroupAction.shouldConnect(items, index, h);
    prev.current = {connectBgNext: connect.next, connectBgPrevious: connect.previous};
    return prev.current;
}
