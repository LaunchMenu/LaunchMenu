import {ITextSelection} from "../../../_types/ITextSelection";

/** The same content stored as by a text field, but for readonly purposes */
export type ITextFieldData = {
    /** The new text to store */
    readonly text: string;
    /** The new selection to store */
    readonly selection: ITextSelection;
};
