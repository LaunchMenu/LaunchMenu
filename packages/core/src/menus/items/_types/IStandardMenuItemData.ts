import {IDataHook} from "model-react";
import {ReactElement} from "react";
import {ISearchHighlighterProps} from "../../../actions/types/search/_types/ISearchHighlighterProps";
import {IThemeIcon} from "../../../styling/theming/_types/IBaseTheme";
import {LFC} from "../../../_types/LFC";
import {IStandardActionBindingData} from "./IStandardActionBindingData";

/**
 * A type for the data passed to a standard menu item
 */
export type IStandardMenuItemData = IStandardActionBindingData & {
    /** The icon of the menu item */
    icon?:
        | IThemeIcon
        | ReactElement
        | ((h?: IDataHook) => IThemeIcon | ReactElement | undefined);
    /** The text-highlighter used to highlight parts of the name/description when this item is found with a search, or null to skip highlighting */
    TextHighlighter?: LFC<ISearchHighlighterProps> | null;
};
