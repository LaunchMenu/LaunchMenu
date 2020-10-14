import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";

/**
 * Content data that can be opened
 */
export type IOpenableContent =
    | {content?: IViewStackItem}
    | {
          content: IViewStackItem; // TODO: replace with content interface
          contentView?: IViewStackItem;
          contentHandler?: IKeyEventListener;
      };
