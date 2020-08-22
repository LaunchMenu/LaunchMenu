import {Field} from "model-react";
import {IInputFieldConfig} from "./IInputFieldConfig";
import {IHighlighter} from "../../../syntax/_types/IHighlighter";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * The data for a field setter
 */
export type IInputFieldExecuteData<T> = {
    /** The field to be altered */
    field: Field<T> | (() => Field<T>);
    /** The context to show the field in */
    context: IIOContext;
    /** The highlighter to highlight the text with */
    highlighter?: IHighlighter;
    /** The input field configuration */
    config: IInputFieldConfig<T>;
} & (
    | {
          /** Whether the change action is undoable */
          undoable?: false;
      }
    | {
          /** Whether the change action is undoable */
          undoable?: true;
          /** The input field configuration */
          config: IInputFieldConfig<T> & {liveUpdate?: false}; // can't live update and have undoable
      }
);
