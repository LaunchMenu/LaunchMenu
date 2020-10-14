import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IUUID} from "../../_types/IUUID";
import {IViewStackItem} from "./IViewStackItem";

/** The content data for the ui layer */
export type IUILayerContentData = {
    /** A unique ID for the given content */
    ID: IUUID;
    /** The content's view */
    contentView: IViewStackItem | undefined;
    /** The content's key handler */
    contentHandler?: IKeyEventListener;
};
