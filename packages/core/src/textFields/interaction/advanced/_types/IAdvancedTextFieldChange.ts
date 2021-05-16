import {ITextSelection} from "../../../_types/ITextSelection";
import {ITextAlterationInput} from "../../commands/_types/ITextAlterationInput";

/** Represents changes to a text field */
export type IAdvancedTextFieldChange = {
    /** The new text to store */
    text?: ITextAlterationInput[];
    /** The new selection to store */
    selection?: ITextSelection;
};
