import {ITextField} from "../../_types/ITextField";
import {retrieveArgument} from "./retrieveArgument";
import {TextEditCommand} from "./TextEditCommand";
import {IRetrievableArgument} from "./_types/IRetrievableArgument";

/** A command to insert some simple text at the caret */
export class InsertTextCommand extends TextEditCommand {
    /**
     * Creates a new command to insert the given text into the text field
     * @param targetField The text field to insert the text into
     * @param content The text to be inserted
     */
    public constructor(textField: ITextField, content: IRetrievableArgument<string>) {
        super(
            textField,
            ({selection}) => {
                content = retrieveArgument(content);

                const start = Math.min(selection.start, selection.end);
                const end = Math.max(selection.start, selection.end);
                const newCaretPos = start + content.length;

                return {
                    text: {start, end, content},
                    selection: {start: newCaretPos, end: newCaretPos},
                };
            },
            {addedText: typeof content == "string" ? content : undefined}
        );
    }
}
