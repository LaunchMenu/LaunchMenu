import {ITextSelection} from "../../../_types/ITextSelection";
import {ITextAlterationInput} from "./ITextAlterationInput";

/** Represents changes to a text field */
export type ITextFieldChange = {
    /** The new text to store */
    text?: ITextAlterationInput;
    /** The new selection to store */
    selection?: ITextSelection;
};
