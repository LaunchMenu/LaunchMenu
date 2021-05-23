import {IItemExecuteCallback} from "../../../actions/types/execute/_types/IItemExecuteCallback";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {IMenu} from "../../../menus/menu/_types/IMenu";
import {IBoxProps} from "../../../styling/box/_types/IBoxProps";

/**
 * The props for the menu item frame component
 */
export type IMenuItemFrameProps = {
    isSelected: boolean;
    isCursor: boolean;
    onExecute?: IItemExecuteCallback;
    menu?: IMenu;
    item?: IMenuItem;
    /** Whether to make the background transparent */
    transparent?: boolean;
    /** Whether to make the item appear disabled, defaults to whether the item is not selectable */
    disabled?: boolean;
    /** Custom color overrides */
    colors?: {
        selection?: IColors;
        container?: IColors;
        border?: string;
    };
    /** outer box props */
    outerProps?: IBoxProps;
    /** inner box props */
    innerProps?: IBoxProps;
};

type IColors = {
    background?: string;
    color?: string;
};
