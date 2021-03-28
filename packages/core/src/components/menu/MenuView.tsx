import React, {useEffect, useMemo, useRef} from "react";
import {FillBox} from "../FillBox";
import {useSmoothScroll} from "../../utils/hooks/useSmoothScroll";
import {IMenuViewProps} from "./_types/IMenuViewProps";
import {useVerticalScroll} from "../../utils/hooks/useVerticalScroll";
import {LFC} from "../../_types/LFC";
import {useTheme} from "../../styling/theming/ThemeContext";
import {getHighlightThemeStyle} from "../../styling/theming/highlighting/getHighlightThemeStyle";
import {useIOContext} from "../../context/react/useIOContext";
import {baseSettings} from "../../application/settings/baseSettings/baseSettings";
import {useDataHook} from "model-react";
import {mergeStyles} from "../../utils/mergeStyles";

/**
 * A standard simple view for a menu
 */
export const MenuView: LFC<IMenuViewProps> = ({
    menu,
    onExecute,
    cursorItemScrollPadding,
    cursorItemScrollDuration,
    smoothScrollDuration,
    containerProps,
}) => {
    // Default settings
    const [h] = useDataHook();
    const context = useIOContext();
    const menuSettings = useMemo(() => context?.settings.get(baseSettings).menu, [
        context,
    ]);
    const normalizedCursorItemScrollPadding =
        cursorItemScrollPadding ?? menuSettings?.scrollPadding.get() ?? 50;
    const normalizedCursorItemScrollDuration = cursorItemScrollDuration ?? {
        far: menuSettings?.scrollWrapSpeed.get() ?? 200,
        near: menuSettings?.scrollSpeed.get() ?? 70,
    };

    // Menu data
    const items = menu.getItems(h);
    const selectedItems = menu.getSelected(h);
    const cursorItem = menu.getCursor(h);
    const highlight = menu.getHighlight?.(h) || null;

    // Make sure the selected is always in the view
    const elRef = useRef<HTMLElement>();
    const cursorRef = useRef<HTMLDivElement>(null);
    const [scrollRef, setScroll] = useSmoothScroll();
    useEffect(() => {
        const el = elRef.current;
        const cursorEl = cursorRef.current;
        if (el && cursorEl) {
            // Retrieve item boundary data
            const {height: menuHeight, top: menuPageOffset} = el.getBoundingClientRect();
            const {
                height: itemHeight,
                top: itemPageOffset,
            } = cursorEl.getBoundingClientRect();
            const scrollTop = el.scrollTop;

            // Calculate the top and bottom item positions in parent (with padding)
            const itemPos = itemPageOffset - menuPageOffset + scrollTop;
            const itemTop = itemPos - normalizedCursorItemScrollPadding;
            const itemBottom = itemPos + itemHeight + normalizedCursorItemScrollPadding;

            // Scroll to the item if needed
            let scrollTarget: number | undefined;
            if (itemTop < scrollTop) scrollTarget = itemTop;
            else if (itemBottom > scrollTop + menuHeight)
                scrollTarget = itemBottom - menuHeight;

            if (scrollTarget) {
                const dist = Math.abs(scrollTop - scrollTarget);
                setScroll(
                    {top: scrollTarget},
                    normalizedCursorItemScrollDuration[dist > 200 ? "far" : "near"]
                );
            }
        }
    }, [cursorItem, items]);

    // Use a vertical scroll hook to enable smooth scrolling
    const wheelScrollRef = useVerticalScroll(smoothScrollDuration);

    // Cache the items, such that we can still display them even tho the menu is already deleted
    const cachedItems = useRef(items);
    if (!menu.isDestroyed()) cachedItems.current = items;

    // Obtain syntax styling for search results
    const theme = useTheme();
    const syntaxStyling = useMemo(() => getHighlightThemeStyle(theme.highlighting), [
        theme,
    ]);

    // Return the menu
    return (
        <FillBox
            className="menu"
            elRef={[elRef, scrollRef, wheelScrollRef]}
            overflow="auto"
            background="bgTertiary"
            zIndex={0}
            {...containerProps}
            css={mergeStyles(syntaxStyling, containerProps?.css)}>
            {cachedItems.current.map((menuItem, i) => {
                const isCursor = cursorItem == menuItem;
                // TODO: look into the possibility of using menuItems as keys (using some ID?)
                return (
                    <div key={i} ref={isCursor ? cursorRef : undefined}>
                        <menuItem.view
                            isSelected={selectedItems.includes(menuItem)}
                            onExecute={onExecute}
                            isCursor={isCursor}
                            highlight={highlight}
                            menu={menu}
                            item={menuItem}
                        />
                    </div>
                );
            })}
        </FillBox>
    );
};
