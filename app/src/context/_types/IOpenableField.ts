import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {ITextField} from "../../textFields/_types/ITextField";
import {ReactElement} from "react";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";
import {IThemeIcon} from "../../styling/theming/_types/IBaseTheme";
import {IPartialIOContext} from "./IIOContext";
import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";

/**
 * Field data that can be opened
 */
export type IOpenableField =
    | {
          /** UI to be opened in the field stack */
          field?: IViewStackItem;
      }
    | {
          /** The field to be opened */
          field: ITextField;
          /** The view of the field, will be generated if left out */
          fieldView?: IViewStackItem;
          /** The key handler for the field, will be generated if left out */
          fieldHandler?: IKeyEventListener;
          /** The syntax highlighter to use for the text field, will be ignored if a view is provided */
          highlighter?: IHighlighter;
          /** The icon to show with the text field, will be ignored if a view is provided */
          icon?: IThemeIcon | ReactElement;
          /** Whether or not to destroy the field when removed from the stack, defaults to true */
          destroyOnClose?: boolean;
      };

/**
 * Retrieves the required context data for a openable field
 */
export type TPartialContextFromField<IOpenable> =
    // field -> panes.field
    (IOpenable extends {field: any} ? {panes: {field: IViewStack}} : unknown) &
        // field==ITextField || fieldHandler -> keyHandler
        (IOpenable extends {field: ITextField} | {fieldHandler: any}
            ? {keyHandler: IKeyHandlerStack}
            : unknown) &
        IPartialIOContext;
