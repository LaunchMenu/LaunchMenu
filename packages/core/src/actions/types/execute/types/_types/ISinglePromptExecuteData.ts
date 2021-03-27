import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {IField} from "../../../../../_types/IField";
import {IActionBinding} from "../../../../_types/IActionBinding";

/**
 * The data for combining data prompts
 */
export type ISinglePromptExecuteData<T> = {
    // Use either fields or setValues
    /** The fields for which to update the value. Either fields or setValues should be used as output. */
    fields?: IField<T>[];
    /** The callback that sets the value, or retrieves the commands to be used to set them. Either fields or setValues should be used as output.  */
    setValues?: (value?: T) => Promise<ICommand[] | void> | ICommand[] | void;
    /* The initial values to use in the prompt. Either fields or init should be set. */
    init?: T[];

    // The function to perform the value retrieval
    /** Retrieves the execute action binding to update the field, or the value itself*/
    valueRetriever: ((field: IField<T>) => IActionBinding) | (() => Promise<T>);

    // Additional config
    /** Tests whether two values are equal to one and another, for determining the initial field value */
    equals?: (a: T, b: T) => boolean;
    /** Whether the value update should be undoable */
    undoable?: boolean;
    /** The name that the command should display */
    commandName?: string;
};
