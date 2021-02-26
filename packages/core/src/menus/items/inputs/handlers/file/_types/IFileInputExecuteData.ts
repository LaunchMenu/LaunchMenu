import {IField} from "../../../../../../_types/IField";

/**
 * The data that can be applied to the file input executer
 */
export type IFileInputExecuteData = {
    /** The field to store the boolean in */
    field: IField<string>;
    /** Whether the selected file should be a folder */
    folder?: boolean;
    /** Whether the change action is undoable */
    undoable?: boolean;
};
