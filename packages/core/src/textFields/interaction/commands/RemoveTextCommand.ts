import {ITextField} from "../../_types/ITextField";
import {retrieveArgument} from "./retrieveArgument";
import {TextEditCommand} from "./TextEditCommand";
import {IRetrievableArgument} from "./_types/IRetrievableArgument";
import {ITextAlterationInput} from "./_types/ITextAlterationInput";

/** A command to remove text at the caret */
export class RemoveTextCommand extends TextEditCommand {
    /**
     * Creates a new command to remove text from the text field in the given direction
     * @param targetField The text field to remove the text from
     * @param direction The amount of characters to remove and the direction (-1 == backspace)
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
            // If the direction is backwards remove before the cursor and move the cursor backwards
            else if (direction < 0) {
                alteration = {start: Math.max(0, start + direction), end, content: ""};
                newCaretPos = selection.start + direction;
            }
            // If the direction is forwards remove after the cursor
            else alteration = {start, end: end + direction, content: ""};

            // Return the nee changes and new selection
            return {text: alteration, selection: {start: newCaretPos, end: newCaretPos}};
        });
    }
}
