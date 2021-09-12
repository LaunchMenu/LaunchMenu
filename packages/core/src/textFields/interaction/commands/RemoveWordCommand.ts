import {FaMaxcdn} from "react-icons/fa";
import {ITextField} from "../../_types/ITextField";
import {getJumpTokenPos} from "../getJumpTokenPos";
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

            newCaretPos = getJumpTokenPos(textField.get(), start, direction, false);
            let min = Math.min(newCaretPos, start);
            let max = Math.max(newCaretPos, start);
            alteration = {
                start: min,
                end: max,
                content: "",
            };

            // Return the new changes and new selection
            return {text: alteration, selection: {start: min, end: min}};
        });
    }
}
