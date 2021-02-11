import {
    ExecutionState,
    Field,
    getExceptions,
    IDataHook,
    isLoading,
    Observer,
} from "model-react";
import {IFieldsTree} from "./_types/IFieldsTree";
import FS from "fs";
import {IJSON} from "../../../../_types/IJSON";
import {ExtendedObject} from "../../../../utils/ExtendedObject";
import mkdirp from "mkdirp";
import Path from "path";
import {ISavable} from "../_types/ISavable";
import {IFieldFileChangeListener} from "./_types/IFieldsFileChangeListener";
import {IField} from "../../../../_types/IField";
import {ISerializeField} from "./_types/ISerializedField";
import {promisify} from "util";
import {getLCS} from "../../../../utils/getLCS";

/**
 * A file that stores the value of the fields
 */
export class FieldsFile<F extends IFieldsTree> implements ISavable {
    protected filePath: string;

    protected loading = new ExecutionState();
    protected loadTime: number = 0;
    protected dirty = new Field(false);

    protected observers: Observer<any>[] = [];
    protected listeners: IFieldFileChangeListener[] = [];

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
        this.setupFieldListeners(this.fields);
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
        await mkdirp(Path.dirname(this.filePath));

        // Check if the data changed
        if (FS.existsSync(this.filePath)) {
            const currentData = await promisify(FS.readFile)(this.filePath, "utf8");
            if (!this.isDataDifferent(currentData)) return;
        }

        // If the data changed, write the new data
        const data = JSON.stringify(this.getData(), null, 4);
        await promisify(FS.writeFile)(this.filePath, data, "utf8");
        if (this.dirty.get()) this.dirty.set(false);
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
        return this.loading.add(
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
                            if (this.isDataDifferent(data))
                                this.setData(JSON.parse(data));
                            if (this.dirty.get()) this.dirty.set(false);
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
     * Checks whether the specified data is different than the currently loaded data
     * @param data The data to check
     * @returns Whether the data is different
     */
    protected isDataDifferent(data: string): boolean {
        try {
            return JSON.stringify(JSON.parse(data)) != JSON.stringify(this.getData());
        } catch (e) {
            return true;
        }
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
            if (isSerializeField(f)) {
                return f.getSerialized();
            } else if (isField(f)) {
                return f.get();
            } else {
                return this.encode(f);
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
                if (val != field.getSerialized()) field.setSerialized(val);
            } else if (
                "set" in field &&
                field.set instanceof Function &&
                "get" in field &&
                field.get instanceof Function
            ) {
                if (val != field.get()) field.set(val);
            } else if (typeof val == "object") {
                this.decode(val, field as IFieldsTree);
            }
        });
    }

    // Change listener setup
    /**
     * Registers a listener that gets called when any of the fields have been updated
     * @param onChange The listener to be registered
     */
    public addChangeListener(onChange: IFieldFileChangeListener): void {
        if (!this.listeners.includes(onChange)) this.listeners.push(onChange);
    }

    /**
     * Removes a listener that was listening for field changes
     * @param onChange The listener to be removed
     */
    public removeChangeListener(onChange: IFieldFileChangeListener): void {
        const index = this.listeners.indexOf(onChange);
        if (index != -1) this.listeners.splice(index, 1);
    }

    /**
     * Sets up all the observers to listen for field changes
     * @param data The fields tree to setup listeners for
     * @param path The path so far
     */
    protected setupFieldListeners(data: IFieldsTree, path: string = ""): void {
        Object.entries(data).forEach(([key, f]) => {
            const childPath = path ? `${path}.${key}` : key;
            if (isSerializeField(f)) {
                this.observers.push(
                    new Observer(h => f.getSerialized(h)).listen(() =>
                        this.emitChange(f, childPath)
                    )
                );
            } else if (isField(f)) {
                this.observers.push(
                    new Observer(h => f.get(h)).listen(() =>
                        this.emitChange(f, childPath)
                    )
                );
            } else {
                this.setupFieldListeners(f);
            }
        });
    }

    /**
     * Emits a change event
     * @param field The field that changed
     * @param path The path of the field that changed
     */
    protected emitChange(
        field: ISerializeField<IJSON> | IField<IJSON>,
        path: string
    ): void {
        if (!this.dirty.get()) this.dirty.set(true);
        this.listeners.forEach(listener => listener(field, path));
    }

    /**
     * Retrieves whether there are any changes that aren't synced to the file on disk
     * @param hook The hook to subscribe to changes
     * @returns Whether there are any unsaved changes
     */
    public isDirty(hook?: IDataHook): boolean {
        return this.dirty.get(hook);
    }

    /**
     * Disposes all of the field listeners
     */
    public destroy(): void {
        this.observers.forEach(observer => observer.destroy());
    }
}

/**
 * Checks whether the given data is a serialize field
 * @param data The data to check
 * @returns Whether it's a serialize field
 */
export function isSerializeField(
    data: IFieldsTree | IField<IJSON> | ISerializeField<IJSON>
): data is ISerializeField<IJSON> {
    return "getSerialized" in data && data.getSerialized instanceof Function;
}

/**
 * Checks whether the given data is a field
 * @param data The data to check
 * @returns Whether it's a field
 */
export function isField(
    data: IFieldsTree | IField<IJSON> | ISerializeField<IJSON>
): data is IField<IJSON> {
    return "get" in data && data.get instanceof Function;
}
