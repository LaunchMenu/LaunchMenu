import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IPartialIOContext} from "./IIOContext";
import {IViewStack} from "../../stacks/_types/IViewStack";

/**
 * Content data that can be opened
 */
export type IOpenableContent =
    | {content?: IViewStackItem}
    | {
          content: string; // TODO: replace with content interface
          contentView?: IViewStackItem;
          contentHandler?: IKeyEventListener;
      };

/**
 * Retrieves the required context data for a openable content
 */
export type TPartialContextFromContent<IOpenable> =
    // content -> panes.field
    (IOpenable extends {content: any} ? {panes: {content: IViewStack}} : unknown) &
        IPartialIOContext;
