import {ITextSelection} from "../../../_types/ITextSelection";

/** A type to represent changes in text */
export type ITextAlterationInput = ITextSelection & {
    /** The text that te given range is replaced by */
    text: string;
};
