import {IDataHook} from "model-react";
import {ITextSelection} from "./ITextSelection";
import {IUIModel} from "../../context/_types/IUIModel";
import {IViewStackItem} from "../../stacks/_types/IViewStackItem";

/**
 * A mutable field to contain a text input as well as the selected range
 */
export type ITextField = {
    /** A possible default view for the field */
    readonly view?: IViewStackItem;

    /**
     * Sets the value of the text field
     * @param text The new text
     */
    set(text: string): void;

    /**
     * Retrieves the value of the text field
     * @param hook The hook to subscribe to changes
     * @returns The current text
     */
    get(hook?: IDataHook): string;

    /**
     * Sets the selection range
     * @param selection The new selection
     */
    setSelection(selection: ITextSelection): void;

    /**
     * Retrieves the selected range (or cursor if start==end)
     * @param hook The hook to subscribe to changes
     * @returns The selected range
     */
    getSelection(hook?: IDataHook): ITextSelection;
} & IUIModel;
