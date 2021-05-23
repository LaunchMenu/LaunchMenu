import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {ITextAlteration} from "./ITextAlteration";

/**
 * The interface for a command to be a text edit command
 */
export type ITextEditCommand = ICommand & {
    /**
     * Retrieves the text that's added by the command, if the text is known ahead of time (or the command is already executed)
     * @returns The known text at this point in time
     */
    getAddedText(): string | undefined;

    /**
     * Retrieves whether the given command only alters the selection and doesn't change text
     * @returns Whether only the selection is changed
     */
    isSelectionChange(): boolean;

    /**
     * Retrieves the text alterations performed by the command (only if the command fully executed at least once)
     * @returns The text alterations, which is possibly empty if not yet executed
     */
    getAlterations(): ITextAlteration[];
};

/**
 * Retrieves whether a given command is a text edit command
 * @param command The command to check
 * @returns Whether the given command is a text edit command
 */
export function isTextEditCommand(
    command: ICommand | ITextEditCommand
): command is ITextEditCommand {
    return "getAddedText" in command && "isSelectionChange" in command;
}
