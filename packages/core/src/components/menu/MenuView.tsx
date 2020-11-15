import React, {useEffect, useRef} from "react";
import {useDataHook} from "model-react";
import {FillBox} from "../FillBox";
import {useSmoothScroll} from "../../utils/hooks/useSmoothScroll";
import {IMenuViewProps} from "./_types/IMenuViewProps";
import {useVerticalScroll} from "../../utils/hooks/useVerticalScroll";
import {LFC} from "../../_types/LFC";
import {useTheme} from "../../styling/theming/ThemeContext";

/**
 * A standard simple view for a menu
 */
export const MenuView: LFC<IMenuViewProps> = ({
    menu,
    onExecute,
    cursorItemScrollPadding = 50,
    cursorItemScrollDuration = {far: 200, near: 70},
    smoothScrollDuration,
}) => {
    const [h] = useDataHook();
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
            const itemTop = itemPos - cursorItemScrollPadding;
            const itemBottom = itemPos + itemHeight + cursorItemScrollPadding;

            // Scroll to the item if needed
            let scrollTarget: number | undefined;
            if (itemTop < scrollTop) scrollTarget = itemTop;
            else if (itemBottom > scrollTop + menuHeight)
                scrollTarget = itemBottom - menuHeight;

            if (scrollTarget) {
                const dist = Math.abs(scrollTop - scrollTarget);
                setScroll(
                    {top: scrollTarget},
                    cursorItemScrollDuration[dist > 200 ? "far" : "near"]
                );
            }
        }
    }, [cursorItem, items]);

    // Use a vertical scroll hook to enable smooth scrolling
    const wheelScrollRef = useVerticalScroll(smoothScrollDuration);

    // Cache the items, such that we can still display them even tho the menu is already deleted
    const cachedItems = useRef(items);
    if (!menu.isDestroyed()) cachedItems.current = items;

    const theme = useTheme();
    return (
        <FillBox
            className="menu"
            elRef={[elRef, scrollRef, wheelScrollRef]}
            overflow="auto"
            background="bgTertiary"
            zIndex={1}
            // Add custom scrollbar styling
            css={{
                "&::-webkit-scrollbar": {
                    width: 15,
                },
                "&::-webkit-scrollbar-track": {
                    background: theme.color.bgTertiary,
                },
                "&::-webkit-scrollbar-thumb": {
                    background: theme.color.bgPrimary,
                    border: "3px solid",
                    borderColor: "transparent",
                    backgroundClip: "padding-box",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    background: theme.color.primary,
                    border: "3px solid",
                    borderColor: "transparent",
                    backgroundClip: "padding-box",
                },
            }}>
            {cachedItems.current.map((menuItem, i) => {
                const isCursor = cursorItem == menuItem;
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
