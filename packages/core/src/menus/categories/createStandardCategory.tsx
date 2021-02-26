import {ICategory} from "../../actions/types/category/_types/ICategory";
import {MenuItemFrame} from "../../components/items/MenuItemFrame";
import React, {memo, ReactElement} from "react";
import {MenuItemLayout} from "../../components/items/MenuItemLayout";
import {Box} from "../../styling/box/Box";
import {IThemeIcon} from "../../styling/theming/_types/IBaseTheme";
import {useDataHook} from "model-react";
import {ISubscribable} from "../../utils/subscribables/_types/ISubscribable";
import {getHooked} from "../../utils/subscribables/getHooked";
import {MenuItemIcon} from "../../components/items/MenuItemIcon";

/**
 * Creates a standard category
 * @param data The category data
 * @returns The category
 */
export function createStandardCategory({
    name,
    description,
    icon,
}: {
    /** The name of the category */
    name: string;
    /** The description of the category */
    description?: string;
    /** The icon to show next to the name */
    icon?: ISubscribable<IThemeIcon | ReactElement | undefined>;
}): ICategory {
    return {
        name,
        description,
        item: {
            view: memo(({highlight, ...props}) => {
                const [h] = useDataHook();
                const iconV = getHooked(icon, h);
                return (
                    <MenuItemFrame {...props} transparent>
                        <MenuItemLayout
                            icon={iconV && <MenuItemIcon icon={iconV} />}
                            name={
                                <Box font="header" css={{fontWeight: "bold"}}>
                                    {name}
                                </Box>
                            }
                        />
                    </MenuItemFrame>
                );
            }),
            actionBindings: [],
        },
    };
}
