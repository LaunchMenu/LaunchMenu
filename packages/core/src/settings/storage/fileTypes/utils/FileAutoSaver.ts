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
    protected listener: () => void;

    /**
     * Creates a new file autosaver
     * @param file The file to be save automatically upon changes
     * @param timeout The timeout duration such that at most 1000/timeout saves happen per second, and the file is saved at most timeout milliseconds after any change (ignoring potential thread blocks)
     */
    public constructor(file: IFile, timeout: number = 1000) {
        this.file = file;
        this.delay = timeout;

        this.listener = () => this.scheduleSave();
        if (file.get) {
            this.observer = new Observer(h => file.get?.(h)).listen(this.listener);
        } else if (file.addChangeListener) {
            file.addChangeListener(this.listener);
        }
    }

    /**
     * Schedules a save for the target file
     */
    public scheduleSave() {
        if (this.timeoutID) return;

        this.timeoutID = setTimeout(() => {
            this.timeoutID = null;
            this.file.save();
        }, this.delay);
    }

    /**
     * Destroys the file auto saver, stopping the autosaving process
     * @param save Whether to force save now if a save was scheduled, or whether to skip the save
     */
    public destroy(save: boolean = true) {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
            if(save) this.file.save();
        }

        this.observer?.destroy();
        this.file.removeChangeListener?.(this.listener);
    }
}
