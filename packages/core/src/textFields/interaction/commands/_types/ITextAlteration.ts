import {ITextSelection} from "../../../_types/ITextSelection";
import {ITextAlterationInput} from "./ITextAlterationInput";

/** A type to represent changes in text */
export type ITextAlteration = ITextAlterationInput & {
    /** The text that te given range contained previously */
    prevText: string;
};
