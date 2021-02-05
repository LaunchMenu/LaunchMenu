import {ISavable} from "./ISavable";

/**
 * The basic interface of a file
 */
export type IFile = ISavable & {
    /**
     * Retrieves the path of the file
     * @returns The path
     */
    getPath(): string;
};
