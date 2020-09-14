export type ISavable = {
    /**
     * Loads the data of the file
     */
    load(): Promise<unknown>;
    /**
     * Saves the data of the file
     */
    save(): Promise<unknown>;
};
