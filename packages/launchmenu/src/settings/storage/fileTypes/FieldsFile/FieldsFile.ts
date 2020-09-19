import {ActionState, Field, getExceptions, isLoading} from "model-react";
import {IFieldsTree} from "./_types/IFieldsTree";
import {IJSONDeserializer} from "../../../_types/serialization/IJSONDeserializer";
import FS from "fs";
import {IJSON} from "../../../../_types/IJSON";
import {ExtendedObject} from "../../../../utils/ExtendedObject";
import mkdirp from "mkdirp";
import Path from "path";
import {ISavable} from "../_types/ISavable";

/**
 * A file that stores the value of the fields
 */
export class FieldsFile<F extends IFieldsTree<T>, T extends IJSONDeserializer = never>
    implements ISavable {
    protected deserializers: T[];
    protected filePath: string;
    protected loading = new ActionState<void>();
    protected loadTime: number = 0;

    // The fields to interact with (equivalent to the input fields)
    public fields: F;

    /**
     * Creates a new fields file object, without custom field types
     * @param data The data to construct the fields file from
     */
    public constructor(data: {
        /** The path of the file */
        path: string;
        /** The fields without any custom types */
        fields: F;
        /** No deserializers */
        deserializers?: undefined;
    });

    /**
     * Creates a new fields file object with custom field types
     * @param data The data to construct the fields file from
     */
    public constructor(data: {
        /** The path of the file */
        path: string;
        /** The custom types for that can be used for deserialization */
        deserializers: T[];
        /** The fields with possible custom types */
        fields: F;
    });
    public constructor(data: {path: string; deserializers?: T[]; fields: F}) {
        this.filePath = data.path;
        this.fields = data.fields;
        this.deserializers = data.deserializers ?? [];
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
                try {
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
                } catch (e) {
                    if (!allowFileNotFound) rej(e);
                    else {
                        console.error(e);
                        res();
                    }
                }
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
    protected encode(data: IFieldsTree<T>): IJSON {
        return ExtendedObject.map(data, f => {
            if ("get" in f && f.get instanceof Function) {
                const val = f.get(null);
                if (
                    typeof val == "object" &&
                    val != null &&
                    "serialize" in val &&
                    val.serialize instanceof Function
                ) {
                    const serialized = (val.serialize as any)();
                    serialized.type = serialized.type;
                    return serialized;
                } else {
                    return val;
                }
            } else {
                return this.encode(f as IFieldsTree<T>);
            }
        });
    }

    /**
     * Decodes the data that was saved on disk to the expected format and stores it in fields
     * @param data The data from the disk
     * @param fields The fields to transfer the data to
     * @throws An exception if the data couldn't be decoded
     */
    protected decode(data: IJSON, fields: IFieldsTree<T>): void {
        ExtendedObject.map(data, (val, key) => {
            const field = fields[key];
            if (
                "set" in field &&
                field.set instanceof Function &&
                "get" in field &&
                field.get instanceof Function
            ) {
                const decoded = this.decodeValue(val);
                if (decoded != field.get(null)) field.set(decoded);
            } else if (typeof val == "object") {
                this.decode(val, field as IFieldsTree<T>);
            }
        });
    }

    /**
     * Decodes a single field value
     * @param data The data from the disk
     * @returns The deserialized value
     */
    protected decodeValue(data: IJSON): any {
        if (typeof data == "object" && data != null && "$$type" in data) {
            const type = data.$$type;
            const deserializer = this.deserializers.find(
                ({jsonTypeName}) => jsonTypeName == type
            );
            if (deserializer) return deserializer.deserialize(data);
        }
        return data;
    }
}
