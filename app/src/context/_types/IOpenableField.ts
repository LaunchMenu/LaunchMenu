import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";

/**
 * Field data that can be opened
 */
export type IOpenableField =
    | {field?: IViewStackItem}
    | {
          field: string; // TODO: replace with field interface
          fieldView: IViewStackItem;
          fieldHandler: IKeyEventListener;
      };
