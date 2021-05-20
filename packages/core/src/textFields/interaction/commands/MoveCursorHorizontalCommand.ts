import {ITextField} from "../../_types/ITextField";
import {getJumpTokenPos} from "../getJumpTokenPos";
import {retrieveArgument} from "./retrieveArgument";
import {TextEditCommand} from "./TextEditCommand";
import {IRetrievableArgument} from "./_types/IRetrievableArgument";

/** A command to move the cursor horizontally */
export class MoveCursorHorizontalCommand extends TextEditCommand {
    /**
     * Creates a new command to move the cursor horizontally (left or right, positive is right)
     * @param textField The text field ot move the cursor for
     * @param direction The movement direction
     * @param expandSelection Whether to alter the current text selection
     * @param jumpWord Whether to jump a whole word (moving a word incros instead of a character)
     */
    public constructor(
        textField: ITextField,
        direction: IRetrievableArgument<number> = 1,
        expandSelection?: IRetrievableArgument<boolean>,
        jumpWord?: IRetrievableArgument<boolean>
    ) {
        super(
            textField,
            ({selection, text}) => {
                direction = retrieveArgument(direction);
                expandSelection = retrieveArgument(expandSelection);
                jumpWord = retrieveArgument(jumpWord);

                // Determine the position to jump to
                let end: number;
                if (jumpWord) end = getJumpTokenPos(text, selection.end, direction);
                else end = selection.end + direction;

                // If we want to expand the selection, only change the end
                if (expandSelection)
                    return {
                        selection: {
                            start: selection.start,
                            end,
                        },
                    };
                // Otherwise move both to the end index
                else {
                    let index: number;
                    if (selection.start != selection.end)
                        index = Math[direction > 0 ? "max" : "min"](
                            selection.end,
                            selection.start
                        );
                    else index = end;

                    return {selection: {start: index, end: index}};
                }
            },
            {isSelectionChange: true}
        );
    }
}
