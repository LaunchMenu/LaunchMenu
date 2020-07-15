import React, {FC} from "react";
import {IMenu} from "./_types/IMenu";
import {useDataHook} from "model-react";
import {FillBox} from "../../components/FillBox";

/**
 * A standard simple view for a menu
 */
export const MenuView: FC<{menu: IMenu}> = ({menu}) => {
    const [h] = useDataHook();
    const items = menu.getItems(h);
    const selectedItems = menu.getSelected(h);
    const cursorItem = menu.getCursor(h);

    return (
        <FillBox background="bgPrimary">
            {items.map((menuItem, i) => (
                <menuItem.view
                    key={i}
                    isSelected={selectedItems.includes(menuItem)}
                    isCursor={cursorItem == menuItem}
                    menu={menu}
                    item={menuItem}
                />
            ))}
        </FillBox>
    );
};
