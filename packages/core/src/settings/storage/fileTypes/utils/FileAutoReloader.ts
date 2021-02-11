import {IFile} from "../_types/IFile";
import {FSWatcher, watch} from "chokidar";

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
            this.file.load();
        }, this.delay);
    }

    /**
     * Destroys the file watcher
     * @param load Whether to force load now if a lad was scheduled, or whether to skip the load
     */
    public async destroy(load: boolean = true): Promise<void> {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
            if (load) this.file.load();
        }

        return this.watcher.close();
    }
}
