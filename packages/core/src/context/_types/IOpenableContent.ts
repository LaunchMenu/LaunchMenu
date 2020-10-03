import {IViewStackItem} from "../../stacks/viewStack/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";

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
