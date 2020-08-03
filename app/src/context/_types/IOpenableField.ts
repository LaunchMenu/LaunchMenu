import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {ITextField} from "../../textFields/_types/ITextField";
import {IIconProps} from "@fluentui/react";
import {ReactElement} from "react";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";

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
          icon?: IIconProps | ReactElement;
          /** Whether or not to destroy the field when removed from the stack, defaults to true */
          destroyOnClose?: boolean;
      };
