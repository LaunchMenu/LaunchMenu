import {ITextField} from "../_types/ITextField";
import {ITextSelection} from "../_types/ITextSelection";
import {CompoundTextEditCommand} from "./commands/CompoundTextEditCommand";
import {TextAlterationTools} from "./commands/TextAlterationTools";
import {TextEditCommand} from "./commands/TextEditCommand";
import {ITextAlterationInput} from "./commands/_types/ITextAlterationInput";
import {ITextEditCommand} from "./commands/_types/ITextEditCommand";
import {ITextEditTarget} from "./_types/ITextEditTarget";

/**
 * Performs a text edit using a normalized callback, either passing a command or performing the alteration immediately
 * @param target The target of the text change
 * @param edit The callback to perform the text change
 */
export function performNormalizedTextEdit(
    target: ITextEditTarget,
    edit: (
        textField: ITextField,
        undoable: boolean
    ) =>
        | ITextEditCommand
        | {alterations: ITextAlterationInput[]; selection?: ITextSelection}
): void {
    const textField = "textField" in target ? target.textField : target;

    // Use the callback to retrieve the changes
    const result = edit(textField, "textField" in target);

    // Retrieve the potential result command, or result alterations
    const resultCommand = "getAlterations" in result ? result : undefined;
    const resultAlterations =
        "alterations" in result
            ? {
                  ...result,
                  alternations: result.alterations.sort(
                      ({start: a}, {start: b}) => a - b
                  ),
              }
            : undefined;
    if (
        resultAlterations?.alterations.some(
            (item, i, all) => item.end > all[i + 1]?.start
        )
    )
        throw Error(
            "Alterations may not overlap each other, use a compound command instead"
        );

    // Check the result and perform the necessary action
    if ("textField" in target) {
        // If a command was returned, simply return the command
        if (resultCommand) target.onChange(resultCommand);
        // If alterations were returned, turn it into a command
        else if (resultAlterations) {
            const {alterations, selection} = resultAlterations;

            const commands = alterations.map(
                alteration => new TextEditCommand(textField, alteration, selection)
            );
            if (commands.length == 1) target.onChange(commands[0]);
            else if (commands.length > 1) {
                const command = new CompoundTextEditCommand(commands as any);
                target.onChange(command);
            }
        }
    } else {
        // If a command was returned, simply execute the command
        if (resultCommand) resultCommand.execute();
        // If alterations were returned, combine them into the new text
        else if (resultAlterations) {
            const {alterations, selection} = resultAlterations;

            const newText = TextAlterationTools.performAlterations(
                textField.get(),
                alterations
            );
            target.set(newText);
            if (selection) target.setSelection(selection);
        }
    }
}

/**
 * Retrieves the text field given a text edit target
 * @param targetField The text edit target
 * @returns The text field
 */
export const getEditTargetTextField = (targetField: ITextEditTarget): ITextField =>
    "textField" in targetField ? targetField.textField : targetField;
