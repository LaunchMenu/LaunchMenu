import React, {FC, useEffect, useRef} from "react";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {useDataHook} from "model-react";
import {FillBox} from "../FillBox";
import {useSmoothScroll} from "../../utils/hooks/useSmoothScroll";
import {IMenuViewProps} from "./_types/IMenuViewProps";
import {useVerticalScroll} from "../../utils/hooks/useVerticalScroll";

/**
 * A standard simple view for a menu
 */
export const MenuView: FC<IMenuViewProps> = ({
    menu,
    cursorItemScrollPadding = 30,
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

    return (
        <FillBox
            elRef={[elRef, scrollRef, wheelScrollRef]}
            overflow="auto"
            background="bgPrimary">
            {items.map((menuItem, i) => {
                const isCursor = cursorItem == menuItem;
                return (
                    <div key={i} ref={isCursor ? cursorRef : undefined}>
                        <menuItem.view
                            isSelected={selectedItems.includes(menuItem)}
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
