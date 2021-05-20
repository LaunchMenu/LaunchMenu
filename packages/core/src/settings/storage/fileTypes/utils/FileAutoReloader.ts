import {IFile} from "../_types/IFile";
import {FSWatcher, watch} from "chokidar";
import FS from "fs";

/**
 * A file watcher that can be used to actively watch a given file, and reload it on changes
 */
export class FileAutoReloader {
    protected file: IFile;
    protected watcher: FSWatcher;

    protected timeoutID: NodeJS.Timeout | null = null;
    protected delay: number;

    /**
     * Creates a new file watcher
     * @param file The file to be watched
     * @param events The file events to listen to, defaults to 'change'
     * @param timeout The timeout duration such that at most 1000/timeout reloads happen per second, and the file is reloaded at most timeout milliseconds after any change (ignoring potential thread blocks)
     */
    public constructor(
        file: IFile,
        events: ("add" | "addDir" | "change" | "unlink" | "unlinkDir")[] = ["change"],
        timeout: number = 10
    ) {
        this.file = file;
        this.delay = timeout;
        this.watcher = watch(file.getPath(), {depth: 0});
        events.map(event => this.watcher.on(event, () => this.scheduleLoad()));
    }

    /**
     * Schedules a save for the target file
     */
    public scheduleLoad() {
        if (this.timeoutID) return;

        this.timeoutID = setTimeout(() => {
            this.timeoutID = null;
            this.load();
        }, this.delay);
    }

    /**
     * Loads the file from disk, only if the current data differs than that on disk
     */
    protected async load(): Promise<void> {
        // Only load if the file change wasn't caused by a save
        if (
            this.file.getLatestSaveDate() <
            FS.statSync(this.file.getPath()).mtime.getTime()
        ) {
            this.file.load();
        }
    }

    /**
     * Destroys the file watcher
     * @param load Whether to force load now if a lad was scheduled, or whether to skip the load
     */
    public async destroy(load: boolean = true): Promise<void> {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
            console.log("Destroy");
            if (load) this.load();
        }

        return this.watcher.close();
    }
}
