import {IHighlighter} from "../../../syntax/_types/IHighlighter";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IField} from "../../../../_types/IField";
import {IMultiSelectFieldConfig} from "./IMultiselectFieldConfig";
import {IOpenableUI} from "../../../../context/_types/IOpenableUI";

/**
 * The data for a multi select field setter
 */
export type IMultiSelectFieldExecuteData<T> = {
    /** The field to be altered */
    field: IField<T[]>;
    /** The context to show the field in */
    context: IIOContext;
    /** The highlighter to highlight the text with */
    highlighter?: IHighlighter;
    /** The input field configuration */
    config: IMultiSelectFieldConfig<T>;
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
          config: {liveUpdate?: false}; // can't live update and have undoable
      }
);
