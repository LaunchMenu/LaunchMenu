import {
    Field,
    isLoading,
    getExceptions,
    IDataHook,
    isDataLoadRequest,
    ExecutionState,
    DataCacher,
} from "model-react";
import FS from "fs";
import Path from "path";
import mkdirp from "mkdirp";
import {promisify} from "util";
import {IFile} from "./_types/IFile";

/**
 * A file class for simple data management
 */
export class File<T = string, I extends T = T> extends Field<T> implements IFile {
    protected filePath: string;
    protected loading = new ExecutionState();
    protected loadPromise: Promise<T> | null = null;
    protected loadTime: number = 0;
    protected encoding: BufferEncoding;

    /**
     * Creates a new file
     * @param path The path to store the file at
     * @param load Whether to load the data immediately
     * @param init The initial value to store while no value is specified
     * @param encoding The file encoding type
     */
    public constructor(
        path: string,
        load: boolean = false,
        init: I = "" as any,
        encoding: BufferEncoding = "utf8"
    ) {
        super(init);
        this.filePath = path;
        this.encoding = encoding;
        if (load) this.load();
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
    public async readRaw(): Promise<any> {
        try {
            const data = await promisify(FS.readFile)(this.filePath, this.encoding);
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
    public async load(allowFileNotFound: boolean = true): Promise<T> {
        // Don't reload the data if it's already loading, instead return the same result
        if (isLoading(h => this.loading.get(h)) && this.loadPromise) {
            return this.loadPromise;
        }

        // If the data isn't loading currently, reload it
        this.loadTime = Date.now();
        this.loadPromise = (async () => {
            if (!FS.existsSync(this.filePath)) {
                const err = new Error(`File "${this.filePath}" could not be found`);
                if (!allowFileNotFound) throw err;

                console.warn(err);
                return this.get();
            }

            try {
                const data = await this.readRaw();
                if (data && this.isDataDifferent(data)) this.set(this.decode(data));
            } catch (e) {
                console.error(e);
            }
            return this.get();
        })();
        return this.loading.add(this.loadPromise);
    }

    /**
     * Saves the data to file
     * @throws An exception if the file couldn't be written to
     */
    public async save(): Promise<void> {
        await mkdirp(Path.dirname(this.filePath));

        // Check if the data changed
        if (FS.existsSync(this.filePath)) {
            const currentData = await promisify(FS.readFile)(
                this.filePath,
                this.encoding
            );
            if (!this.isDataDifferent(currentData)) return;
        }

        // IF the data changed, write the new data
        await promisify(FS.writeFile)(this.filePath, this.getRaw(), this.encoding);
    }

    /**
     * Checks whether the specified data is different than the currently loaded data
     * @param data The data to check
     * @returns Whether the data is different
     */
    protected isDataDifferent(data: string): boolean {
        try {
            return this.getRaw() != data;
        } catch (e) {
            return true;
        }
    }

    /**
     * Encodes the data to something that's savable on disk
     * @param data The data to be encoded
     * @throws An exception if the data couldn't be encoded
     * @returns The encoded data
     */
    protected encode(data: T): any {
        return data;
    }

    /**
     * Decodes the data that was saved on disk to the expected format
     * @param data The data from the disk
     * @throws An exception if the data couldn't be decoded
     * @returns The data in the expected format
     */
    protected decode(data: any): T {
        return data as T;
    }

    /** Caches the encoded version of the data */
    protected encodedValue = new DataCacher(h => this.encode(this.get(h)));

    /**
     * Retrieves the data that's savable to disk
     * @param hook The hook to subscribe to changes
     * @returns The data that could be written to disk
     */
    public getRaw(hook?: IDataHook): any {
        return this.encodedValue.get(hook);
    }

    // Data interaction
    /**
     * Sets the new data
     * @param data The data to be set
     */
    public set(data: T): void {
        super.set(data);
        if (this.loadPromise) this.loading.remove(this.loadPromise);
    }

    /**
     * Retrieves the data, and starts loading it from disk if requested
     * @param hook The hook to subscribe to changes and possibly indicate to reload the data
     * @returns The current data
     */
    public get(hook?: IDataHook): T {
        // Load the data if requested
        if (
            isDataLoadRequest(hook) &&
            hook.refreshData &&
            (hook.refreshTimestamp ?? 1) > this.loadTime
        ) {
            this.load();
        }

        this.loading.get(hook);
        return super.get(hook);
    }
}
