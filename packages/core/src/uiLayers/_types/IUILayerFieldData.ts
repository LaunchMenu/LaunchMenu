import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";
import {ITextField} from "../../textFields/_types/ITextField";
import {IUUID} from "../../_types/IUUID";
import {IThemeIcon} from "../../styling/theming/_types/IBaseTheme";
import {ReactElement} from "react";
import {IViewStackItem} from "./IViewStackItem";

/** The field data for the ui layer */
export type IUILayerFieldData = {
    /** A unique ID for the given field */
    ID: IUUID;
    /** The field's view */
    fieldView: IViewStackItem;
    /** The field data structure */
    field?: ITextField;
    /** The field's key handler */
    fieldHandler?: IKeyEventListener;
    /** The highlighter to use for the field if any */
    highlighter?: IHighlighter;
    /** The icon to show at the start of the field */
    icon?: IThemeIcon | ReactElement;
    /** The overlay group to use, making sure that only the bottom view with the same group in a continuous sequence is shown */
    overlayGroup?: Symbol;
};
