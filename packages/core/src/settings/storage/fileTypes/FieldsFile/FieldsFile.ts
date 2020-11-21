import {ActionState, Field, getExceptions, isLoading} from "model-react";
import {IFieldsTree} from "./_types/IFieldsTree";
import FS from "fs";
import {IJSON} from "../../../../_types/IJSON";
import {ExtendedObject} from "../../../../utils/ExtendedObject";
import mkdirp from "mkdirp";
import Path from "path";
import {ISavable} from "../_types/ISavable";

/**
 * A file that stores the value of the fields
 */
export class FieldsFile<F extends IFieldsTree> implements ISavable {
    protected filePath: string;
    protected loading = new ActionState<void>();
    protected loadTime: number = 0;

    // The fields to interact with (equivalent to the input fields)
    public fields: F;

    /**
     * Creates a new fields file object with custom field types
     * @param data The data to construct the fields file from
     */
    public constructor(data: {
        /** The path of the file */
        path: string;
        /** The fields with possible custom types */
        fields: F;
    }) {
        this.filePath = data.path;
        this.fields = data.fields;
    }

    /**
     * Retrieves the path of this file
     */
    public getPath(): string {
        return this.filePath;
    }

    /**
     * Retrieves the stats of this file
     * @throws An exception if the file couldn't be accessed
     * @returns The stats
     */
    public async getStats(): Promise<FS.Stats> {
        return new Promise((res, rej) => {
            FS.stat(this.filePath, {bigint: false}, (err, data) => {
                if (err) rej(err);
                else res(data as FS.Stats);
            });
        });
    }

    // Disk interaction
    /**
     * Saves the data to file
     * @throws An exception if the file couldn't be written to
     */
    public async save(): Promise<void> {
        return new Promise(async (res, rej) => {
            try {
                await mkdirp(Path.dirname(this.filePath));
                FS.writeFile(
                    this.filePath,
                    JSON.stringify(this.getData(), null, 4),
                    "utf8",
                    err => {
                        if (err) rej(err);
                        else res();
                    }
                );
            } catch (e) {
                rej(e);
            }
        });
    }

    /**
     * Loads the data from the file
     * @param allowFileNotFound Whether to allow the file not existing without throwing an error
     * @throws An exception if the file couldn't be read
     */
    public async load(allowFileNotFound: boolean = true): Promise<void> {
        // Don't reload the data if it's already loading, instead return the same result
        if (isLoading(h => this.loading.get(h))) {
            const errors = getExceptions(h => this.loading.get(h));
            if (errors.length > 0) throw errors[0];
        }

        // If the data isn't loading currently, reload it
        return this.loading.addAction(
            new Promise((res, rej) => {
                if (!FS.existsSync(this.filePath)) {
                    const err = Error(`File "${this.filePath}" doesn't exist`);
                    if (!allowFileNotFound) rej(err);
                    else {
                        console.warn(err);
                        res();
                    }
                }
                FS.readFile(this.filePath, "utf8", (err, data) => {
                    if (err) rej(err);
                    else if (data) {
                        this.loadTime = Date.now();
                        try {
                            this.setData(JSON.parse(data));
                            res();
                        } catch (e) {
                            rej(e);
                        }
                    } else res();
                });
            })
        );
    }

    /**
     * Retrieves the data to be saved
     * @returns The data in JSON form
     */
    protected getData(): IJSON {
        return this.encode(this.fields);
    }

    /**
     * Reads the data into the object
     * @param data The data to be stored
     */
    protected setData(data: IJSON): void {
        this.decode(data, this.fields);
    }

    /**
     * Encodes the data from the fields to something that's savable on disk
     * @param data The data to be encoded
     * @throws An exception if the data couldn't be encoded
     * @returns The encoded data
     */
    protected encode(data: IFieldsTree): IJSON {
        return ExtendedObject.map(data, f => {
            if ("getSerialized" in f && f.getSerialized instanceof Function) {
                return f.getSerialized(null);
            } else if ("get" in f && f.get instanceof Function) {
                return f.get(null);
            } else {
                return this.encode(f as IFieldsTree);
            }
        });
    }

    /**
     * Decodes the data that was saved on disk to the expected format and stores it in fields
     * @param data The data from the disk
     * @param fields The fields to transfer the data to
     * @throws An exception if the data couldn't be decoded
     */
    protected decode(data: IJSON, fields: IFieldsTree): void {
        ExtendedObject.map(data, (val, key) => {
            const field = fields[key];
            if (
                "setSerialized" in field &&
                field.setSerialized instanceof Function &&
                "getSerialized" in field &&
                field.getSerialized instanceof Function
            ) {
                if (val != field.getSerialized(null)) field.setSerialized(val);
            } else if (
                "set" in field &&
                field.set instanceof Function &&
                "get" in field &&
                field.get instanceof Function
            ) {
                if (val != field.get(null)) field.set(val);
            } else if (typeof val == "object") {
                this.decode(val, field as IFieldsTree);
            }
        });
    }
}
