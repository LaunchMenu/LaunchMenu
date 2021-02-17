import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {IField} from "../../../../_types/IField";
import {ITextField} from "../../../_types/ITextField";
import {ITextSelection} from "../../../_types/ITextSelection";
import {ITextAlteration} from "./ITextAlteration";

/**
 * The interface for a command to be a text edit command
 */
export type ITextEditCommand = ICommand & {
    /**
     * Retrieves the alterations made by this command, the `prevText` is only stable if the command is already executed
     * @returns The alterations in increasing start index sorted order
     */
    getAlterations(): ITextAlteration[];

    /**
     * Retrieves the text selection after executing this command
     * @returns The text selection
     */
    getSelection(): ITextSelection | undefined;

    /**
     * Retrieves the target to alter the text of
     * @returns The text target
     */
    getTarget(): ITextField | IField<string>;

    /**
     * Retrieves the text that this command will be executed on, or was executed on
     * @returns The text that this command is/was executed on
     */
    getTargetText(): string;

    /**
     * Retrieves the selection that the target has/had before this command executed
     * @returns The selection that was present before execution of this command
     */
    getTargetSelection(): ITextSelection | undefined;
};

/**
 * Retrieves whether a given command is a text edit command
 * @param command The command to check
 * @returns Whether the given command is a text edit command
 */
export function isTextEditCommand(
    command: ICommand | ITextEditCommand
): command is ITextEditCommand {
    return "getAlterations" in command && "getSelection" in command;
}
