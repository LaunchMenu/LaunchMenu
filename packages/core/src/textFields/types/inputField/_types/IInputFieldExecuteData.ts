import {IInputFieldConfig} from "./IInputFieldConfig";
import {IHighlighter} from "../../../syntax/_types/IHighlighter";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IField} from "../../../../_types/IField";
import {IOpenableUI} from "../../../../context/_types/IOpenableUI";

/**
 * The data for a field setter
 */
export type IInputFieldExecuteData<T> = {
    /** The field to be altered */
    field: IField<T>;
    /** The highlighter to highlight the text with */
    highlighter?: IHighlighter;
    /** The input field configuration */
    config?: IInputFieldConfig<T>;
    /** A function to open the UI for custom view handling */
    openUI?: (context: IIOContext, ui: IOpenableUI, onClose: () => void) => () => void;
} & (
    | {
          /** Whether the change action is undoable */
          undoable?: false;
      }
    | {
          /** Whether the change action is undoable */
          undoable?: true;
          /** The input field configuration */
          config?: {liveUpdate?: false}; // can't live update and have undoable
      }
) &
    (T extends string ? unknown : {config: unknown});
