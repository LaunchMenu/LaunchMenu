import {desktopCapturer, remote} from "electron";
import {v4 as uuid} from "uuid";
import Path from "path";
import {Controller} from "./Controller";
import {IRecordingConfig} from "./_types/IRecordingConfig";
import {Recording} from "./Recording";

export class Recorder {
    protected controller: Controller;
    protected streams: Record<
        string,
        {
            stream: MediaStream;
            recordings: Recording[];
        }
    > = {};

    /**
     * Creates a new recorder for the given controller
     * @param controller The controller
     */
    constructor(controller: Controller) {
        this.controller = controller;
    }

    /**
     * Starts recording the LM window
     * @param path The output path
     * @param config Extra recording configuration
     * @returns The created recording
     */
    public async recordLM(
        path: string,
        {
            padding,
            crop,
            ...config
        }: {padding?: {x: number; y: number}} & IRecordingConfig = {}
    ): Promise<Recording> {
        this.controller.checkRunning();

        // Update the window title to connect it with the window
        const window = remote.getCurrentWindow();
        const oldTitle = window.getTitle();
        const ID = uuid();
        window.setTitle(ID);

        // Set cropping from padding
        if (!padding) {
            // Corresponds to the padding used by the standard window-manager applet
            // TODO: find a way to not hard-code this value
            padding = {
                x: 18,
                y: 18,
            };
        }
        if (padding?.x || padding?.y) {
            const [winWidth, winHeight] = window.getSize();
            crop = {
                x: padding.x,
                y: padding.y,
                width: winWidth - padding.x * 2,
                height: winHeight - padding.y * 2,
            };
        }

        // Find the source
        const sources = await desktopCapturer.getSources({types: ["window"]});
        const LMSource = sources.find(source => source.name == ID);
        window.setTitle(oldTitle);

        if (!LMSource) throw new Error("LM window could not be found!");
        return this.record(path, LMSource.id, {crop, ...config}, 1e4);
    }

    /**
     * Starts recording a display
     * @param path The output path
     * @param config Additional configuration
     * @returns The created recording
     */
    public async recordScreen(
        path: string,
        {
            displayPoint: point = {x: 10, y: 10},
            ...config
        }: {
            /** A coordinate that should be within the display to be recorded */
            displayPoint?: {x: number; y: number};
        } & IRecordingConfig = {}
    ): Promise<Recording> {
        this.controller.checkRunning();

        // Find the display to be recorded
        const displays = remote.screen.getAllDisplays();
        const display = displays.find(display => {
            const {x, y, width, height} = display.bounds;
            return (
                x <= point.x &&
                point.x <= x + width &&
                y <= point.y &&
                point.y <= y + height
            );
        });

        // Match the display to the source
        const sources = await desktopCapturer.getSources({types: ["screen"]});
        const displaySource = sources.find(
            source => source.display_id == display?.id + ""
        );

        if (!displaySource) throw new Error("Specified window could not be found!");
        return this.record(path, displaySource.id, config, 2e6);
    }

    /**
     * Starts recording of an arbitrary window
     * @param path The output path
     * @param windowTitle The title of the window to be recorded
     * @param config Extra recording configuration
     * @returns The created recording
     */
    public async recordWindow(
        path: string,
        windowTitle:
            | string
            | ((available: Electron.DesktopCapturerSource[]) => Promise<string> | string),
        config: IRecordingConfig
    ): Promise<Recording> {
        this.controller.checkRunning();

        // Find the source
        const sources = await desktopCapturer.getSources({types: ["window"]});
        const title =
            windowTitle instanceof Function ? await windowTitle(sources) : windowTitle;
        const windowSource = sources.find(source => source.name == title);

        if (!windowSource) throw new Error("Window could not be found!");
        return this.record(path, windowSource.id, config, 1e4);
    }

    /**
     * Records the source with the given decideId
     * @param path The output path
     * @param id The id of the source to record
     * @param config Additional recording configuration
     * @param defaultBitRate The default bitrate to use unless specified differently
     * @returns The ID of the recorder
     */
    protected async record(
        path: string,
        id: string,
        config: IRecordingConfig = {},
        defaultBitRate?: number
    ): Promise<Recording> {
        path = Path.resolve(path);

        // Initialize the stream
        if (!this.streams[id])
            this.streams[id] = {
                stream: await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: "desktop",
                            chromeMediaSourceId: id,
                        },
                    } as any,
                }),
                recordings: [],
            };

        // Create the recording
        const recording = new Recording(path, this.streams[id].stream, {
            ...config,
            defaultBitRate,
            onStop: () => {
                const data = this.streams[id];
                data.recordings = data.recordings.filter(rec => rec != recording);
                if (data.recordings.length == 0) {
                    delete this.streams[id];
                    data.stream.getTracks().forEach(track => track.stop());
                }
            },
        });

        this.streams[id].recordings.push(recording);
        return recording;
    }

    /**
     * Stops all video recordings
     */
    public async stop(): Promise<void> {
        const promises = Object.values(this.streams).flatMap(({recordings}) =>
            recordings.map(recording => recording.stop())
        );
        await Promise.all(promises);
    }

    /**
     * Cancels all recordings
     */
    public cancel(): void {
        Object.values(this.streams).forEach(({recordings}) =>
            recordings.forEach(recording => recording.cancel())
        );
    }

    /**
     * Pauses all recordings
     */
    public pause(): void {
        Object.values(this.streams).forEach(({recordings}) =>
            recordings.forEach(recording => recording.pause())
        );
    }

    /**
     * Resumes all recordings
     */
    public resume(): void {
        Object.values(this.streams).forEach(({recordings}) =>
            recordings.forEach(recording => recording.resume())
        );
    }
}
