import {IContent} from "../../content/_types/IContent";
import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IUUID} from "../../_types/IUUID";
import {IViewStackItem} from "./IViewStackItem";

/** The content data for the ui layer */
export type IUILayerContentData = {
    /** A unique ID for the given content */
    ID: IUUID;
    /** The content's view */
    contentView: IViewStackItem | undefined;
    /** The content data structure */
    content?: IContent;
    /** The content's key handler */
    contentHandler?: IKeyEventListener;
    /** The overlay group to use, making sure that only the bottom view with the same group in a continuous sequence is shown */
    overlayGroup?: Symbol;
    /** Whether to prevent the layer from closing when the user uses their back key, defaults to false */
    handleClose?: boolean;
};
