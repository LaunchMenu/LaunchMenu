import {get1dIndex, get2dIndex} from "../../utils/rangeConversion";
import {ITextField} from "../../_types/ITextField";
import {retrieveArgument} from "./retrieveArgument";
import {TextEditCommand} from "./TextEditCommand";
import {IRetrievableArgument} from "./_types/IRetrievableArgument";

/** A command to move the cursor vertically */
export class MoveCursorVerticalCommand extends TextEditCommand {
    /**
     * Creates a new command to move the cursor vertically (up or down, positive is down)
     * @param textField The text field ot move the cursor for
     * @param direction The movement direction
     * @param expandSelection Whether to alter the current text selection
     */
    public constructor(
        textField: ITextField,
        direction: IRetrievableArgument<number> = 1,
        expandSelection?: IRetrievableArgument<boolean>
    ) {
        super(
            textField,
            ({selection, text}) => {
                direction = retrieveArgument(direction);
                expandSelection = retrieveArgument(expandSelection);

                // Get a point representation of the index
                let startPoint = get2dIndex(text, selection.start);
                let endPoint = get2dIndex(text, selection.end);

                // If we want to expand the selection, only change the end
                if (expandSelection) endPoint.row += direction;
                // Otherwise move both to the end index
                else {
                    let point: {row: number; column: number};
                    if (selection.start != selection.end) {
                        if (direction > 0 == selection.end > selection.start)
                            point = endPoint;
                        else point = startPoint;
                    } else point = endPoint;

                    point.row += direction;
                    startPoint = endPoint = point;
                }

                // Convert back to 1d index representation
                const startIndex = get1dIndex(text, startPoint);
                const endIndex = get1dIndex(text, endPoint);

                // Return the nee changes and new selection
                return {selection: {start: startIndex, end: endIndex}};
            },
            {isSelectionChange: true}
        );
    }
}
