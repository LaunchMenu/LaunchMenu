import {get1dIndex, get2dIndex, getTextLines} from "../../utils/rangeConversion";
import {ITextField} from "../../_types/ITextField";
import {retrieveArgument} from "./retrieveArgument";
import {TextEditCommand} from "./TextEditCommand";
import {IRetrievableArgument} from "./_types/IRetrievableArgument";

/** A command to move the cursor horizontally */
export class JumpCursorCommand extends TextEditCommand {
    /**
     * Creates a new command to jump the cursor to the top, bottom, start of line or end of line
     * @param textField The text field ot move the cursor for
     * @param direction The movement direction
     * @param expandSelection Whether to alter the current text selection
     */
    public constructor(
        textField: ITextField,
        direction: IRetrievableArgument<{dx?: number; dy?: number}>,
        expandSelection?: IRetrievableArgument<boolean>
    ) {
        super(
            textField,
            ({selection, text}) => {
                direction = retrieveArgument(direction);
                expandSelection = retrieveArgument(expandSelection);

                // Get a point representation of the index
                const lines = getTextLines(text, false);
                let endPoint = get2dIndex(text, selection.end);

                // Move the end point
                if (direction.dy) {
                    if (direction.dy > 0) endPoint.row = lines.length - 1;
                    else endPoint.row = 0;
                }
                if (direction.dx) {
                    if (direction.dx > 0) endPoint.column = lines[endPoint.row].length;
                    else endPoint.column = 0;
                }

                // Convert back to 1d index representation
                const endIndex = get1dIndex(text, endPoint);

                return {
                    selection: {
                        start: expandSelection ? selection.start : endIndex,
                        end: endIndex,
                    },
                };
            },
            {isSelectionChange: true}
        );
    }
}
