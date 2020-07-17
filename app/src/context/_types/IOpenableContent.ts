import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";

/**
 * Content data that can be opened
 */
export type IOpenableContent =
    | {content?: IViewStackItem}
    | {
          content: string; // TODO: replace with content interface
          contentView: IViewStackItem;
          contentHandler: IKeyEventListener;
      };
