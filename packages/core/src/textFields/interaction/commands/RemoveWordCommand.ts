import {ITextField} from "../../_types/ITextField";
import {retrieveArgument} from "./retrieveArgument";
import {TextEditCommand} from "./TextEditCommand";
import {IRetrievableArgument} from "./_types/IRetrievableArgument";
import {ITextAlterationInput} from "./_types/ITextAlterationInput";

/** A command to remove a word at the caret */
export class RemoveWordCommand extends TextEditCommand {
    /**
     * Creates a new command to remove a word from the text field in the given direction
     * @param targetField The text field to remove the text from
     * @param direction The direction to remove the word (-1 == backwards)
     */
    public constructor(
        textField: ITextField,
        direction: IRetrievableArgument<number> = -1
    ) {
        super(textField, ({selection}) => {
            direction = retrieveArgument(direction);
            const start = Math.min(selection.start, selection.end);
            const end = Math.max(selection.start, selection.end);

            let newCaretPos = start;
            let alteration: ITextAlterationInput;

            // If text is currently selected, ignore the direction and just remove it
            if (start != end) alteration = {start, end, content: ""};
            // If the direction is backwards remove before the cursor till whitespace and move the cursor backwards
            else if (direction < 0) {
                let startIndex = this.backwardsSearchString(textField.get(), start);
                alteration = {start: startIndex, end, content: ""};
                newCaretPos = startIndex;
            }
            // If the direction is forwards remove after the cursor till whitespace
            else {
                let endIndex = this.forwardsSearchString(textField.get(), start);
                endIndex = endIndex >= 0 ? endIndex : textField.get().length;
                alteration = {start: start, end: endIndex, content: ""};
            }

            // Return the new changes and new selection
            return {text: alteration, selection: {start: newCaretPos, end: newCaretPos}};
        });
    }

    /**
     * Backwards searches the string for the position next word including all spaces around it
     * @param text The text to search in
     * @param startIndex The start index from where the search will start
     * @returns The end index
     */
    private backwardsSearchString(text: string, startIndex: number): number {
        text = text.split("").reverse().join("");
        var reversedStartIndex = text.length - startIndex;
        var endIndex = this.forwardsSearchString(text, reversedStartIndex);
        if (endIndex < 0) return -1;

        return text.length - endIndex;
    }

    /**
     * Forward searches the string for the position next word including all spaces around it
     * @param text The text to search in
     * @param startIndex The start index from where the search will start
     * @returns The end index
     */
    private forwardsSearchString(text: string, startIndex: number): number {
        var searchStartIndex = startIndex + text.substr(startIndex).search(/[^\s]/);
        var firstSpaceIndex = text.substr(searchStartIndex).search(/\s/);
        if (firstSpaceIndex < 0) return -1;

        var firstCharAfterSpace =
            text.substr(searchStartIndex + firstSpaceIndex).search(/[^\s]/) - 1;
        if (firstCharAfterSpace < 0) return -1;

        return searchStartIndex + firstSpaceIndex + firstCharAfterSpace;
    }
}
