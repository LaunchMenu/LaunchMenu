import {
    DataCacher,
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
import {IFieldFileChangeListener} from "./_types/IFieldsFileChangeListener";
import {IField} from "../../../../_types/IField";
import {ISerializeField} from "./_types/ISerializedField";
import {promisify} from "util";
import {IFile} from "../_types/IFile";

/**
 * A file that stores the value of the fields
 */
export class FieldsFile<F extends IFieldsTree> implements IFile {
    protected filePath: string;

    protected loading = new ExecutionState();
    protected loadTime: number = 0;
    protected dirty = new Field(false);

    protected observers: Observer<any>[] = [];
    protected listeners: IFieldFileChangeListener[] = [];

    protected savedDate = new Field(0);
    protected loadedDate = new Field(0);
    protected changedDate = new Field(0);

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
        this.setupEncodingListener();
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
     * Reads the raw contents on disk
     * @returns The contents on disk
     */
    protected async readRaw(): Promise<string | undefined> {
        try {
            const data = await promisify(FS.readFile)(this.filePath, "utf8");
            return data;
        } catch (e) {
            return undefined;
        }
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
        return this.loading
            .add(async () => {
                if (!FS.existsSync(this.filePath)) {
                    const err = new Error(`File "${this.filePath}" could not be found`);
                    if (!allowFileNotFound) throw err;

                    console.warn(err);
                    return;
                }

                const data = await this.readRaw();
                if (data) {
                    this.loadTime = Date.now();
                    try {
                        if (this.isDataDifferent(data)) this.setData(JSON.parse(data));
                        if (this.dirty.get()) this.dirty.set(false);
                    } catch (e) {
                        console.error(e);
                    }
                }
            })
            .finally(() => this.loadedDate.set(Date.now()));
    }

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
        const data = this.getRaw();
        await promisify(FS.writeFile)(this.filePath, data, "utf8");
        if (this.dirty.get()) this.dirty.set(false);
        this.savedDate.set(Date.now());
    }

    // Data encoding
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
            if (!field) {
                console.error(
                    `Property ${key} not found in the field structure for '${this.filePath}'`
                );
                return;
            }
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

    /** Keeps track of the version of the encoded data, in order to invalidate the cache */
    protected encodedValueVersion = new Field(0);

    /** Caches the encoded version of the data */
    protected encodedValue = new DataCacher(h => {
        this.encodedValueVersion.get(h);
        return JSON.stringify(this.getData(), null, 4);
    });

    /**
     * Sets up a base listener that can be used to invalidate the cache
     */
    protected setupEncodingListener(): void {
        this.addChangeListener(() =>
            this.encodedValueVersion.set(this.encodedValueVersion.get() + 1)
        );
    }

    /**
     * Retrieves the data that's savable to disk
     * @param hook The hook to subscribe to changes
     * @returns The data that could be written to disk
     */
    protected getRaw(hook?: IDataHook): any {
        return this.encodedValue.get(hook);
    }

    /**
     * Retrieves the last date at which this virtual file instance was saved (time represents when saving finished)
     * @param hook The hook to subscribe to changes
     * @returns The date represented in milliseconds using Date.now() or 0 if not saved yet
     */
    public getLatestSaveDate(hook?: IDataHook): number {
        return this.savedDate.get(hook);
    }

    /**
     * Retrieves the last date at which this virtual file instance was loaded from disk (time represents when loading finished)
     * @param hook The hook to subscribe to changes
     * @returns The date represented in milliseconds using Date.now() or 0 if not loaded yet
     */
    public getLatestLoadDate(hook?: IDataHook): number {
        return this.loadedDate.get(hook);
    }

    /**
     * Retrieves the last date at which this virtual file instance's contents were changed'
     * @param hook The hook to subscribe to changes
     * @returns The date represented in milliseconds using Date.now() or 0 if not loaded yet
     */
    public getLatestChangeDate(hook?: IDataHook): number {
        return this.changedDate.get(hook);
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
        this.changedDate.set(Date.now());
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
