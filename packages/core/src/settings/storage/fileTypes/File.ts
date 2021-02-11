import {
    Field,
    isLoading,
    getExceptions,
    IDataHook,
    isDataLoadRequest,
    ExecutionState,
} from "model-react";
import FS from "fs";
import Path from "path";
import mkdirp from "mkdirp";
import {ISavable} from "./_types/ISavable";
import {promisify} from "util";

/**
 * A file class for simple data management
 */
export class File<T = string, I extends T = T> extends Field<T> implements ISavable {
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
        this.loadPromise = new Promise(async (res, rej) => {
            try {
                if (!FS.existsSync(this.filePath)) {
                    return res(this.get());
                }
                FS.readFile(this.filePath, this.encoding, (err, data) => {
                    if (err) rej(err);
                    else if (data) {
                        try {
                            if (this.isDataDifferent(data)) this.set(this.decode(data));
                            res(this.get());
                        } catch (e) {
                            rej(e);
                        }
                    } else res(this.get());
                });
            } catch (e) {
                if (!allowFileNotFound) rej(e);
                else {
                    console.error(e);
                    res(this.get());
                }
            }
        });
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
        await promisify(FS.writeFile)(
            this.filePath,
            this.encode(this.get()),
            this.encoding
        );
    }

    /**
     * Checks whether the specified data is different than the currently loaded data
     * @param data The data to check
     * @returns Whether the data is different
     */
    protected isDataDifferent(data: string): boolean {
        try {
            return this.encode(this.get()) != data;
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
