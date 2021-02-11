import {Observer} from "model-react";
import {IFile} from "../_types/IFile";

/**
 * A class that can be used to automatically save files upon changes
 */
export class FileAutoSaver {
    protected file: IFile;
    protected timeoutID: NodeJS.Timeout | null = null;
    protected delay: number;
    protected observer: Observer<unknown> | null = null;

    /**
     * Creates a new file autosaver
     * @param file The file to be save automatically upon changes
     * @param timeout The timeout duration such that at most 1000/timeout saves happen per second, and the file is saved at most timeout milliseconds after any change (ignoring potential thread blocks)
     */
    public constructor(file: IFile, timeout: number = 1000) {
        this.file = file;
        this.delay = timeout;
        this.observer = new Observer(h => file.getRaw(h)).listen(() =>
            this.scheduleSave()
        );
    }

    /**
     * Schedules a save for the target file
     */
    public scheduleSave(): void {
        if (this.timeoutID) return;

        this.timeoutID = setTimeout(async () => {
            this.timeoutID = null;
            this.save();
        }, this.delay);
    }

    /**
     * Saves the file to disk, only if the data has been updated
     */
    protected async save(): Promise<void> {
        if (this.file.getRaw() != (await this.file.readRaw())) {
            this.file.save();
        }
    }

    /**
     * Destroys the file auto saver, stopping the autosaving process
     * @param save Whether to force save now if a save was scheduled, or whether to skip the save
     */
    public destroy(save: boolean = true): void {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
            if (save) this.save();
        }

        this.observer?.destroy();
    }
}
