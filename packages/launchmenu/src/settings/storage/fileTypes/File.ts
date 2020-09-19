import {
    Field,
    ActionState,
    isLoading,
    getExceptions,
    IDataHook,
    isDataLoadRequest,
} from "model-react";
import FS from "fs";
import Path from "path";
import mkdirp from "mkdirp";
import {promisify} from "util";
import {ISavable} from "./_types/ISavable";

/**
 * A file class for simple data management
 */
export class File<T = string, I extends T = T> extends Field<T> implements ISavable {
    protected filePath: string;
    protected loading = new ActionState<T>();
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
        if (isLoading(h => this.loading.get(h))) {
            const errors = getExceptions(h => this.loading.get(h));
            if (errors.length > 0) throw errors[0];
            return this.loading.getLatest(null) as T;
        }

        // If the data isn't loading currently, reload it
        return this.loading.addAction(
            new Promise(async (res, rej) => {
                try {
                    if (!FS.existsSync(this.filePath))
                        await mkdirp(Path.dirname(this.filePath));
                    FS.readFile(this.filePath, this.encoding, (err, data) => {
                        res = rej = () => {};
                        if (err) rej(err);
                        else if (data) {
                            this.loadTime = Date.now();
                            try {
                                // Calling set automatically resets the loading state
                                if (isLoading(h => this.loading.get(h)))
                                    this.set(this.decode(data));
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
     * Saves the data to file
     * @throws An exception if the file couldn't be written to
     */
    public async save(): Promise<void> {
        return new Promise(async (res, rej) => {
            try {
                await mkdirp(Path.dirname(this.filePath));
                FS.writeFile(
                    this.filePath,
                    this.encode(this.get()),
                    this.encoding,
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
        this.loading.reset();
    }

    /**
     * Retrieves the data, and starts loading it from disk if requested
     * @param hook The hook to subscribe to changes and possibly indicate to reload the data
     * @returns The current data
     */
    public get(hook: IDataHook = null): T {
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
