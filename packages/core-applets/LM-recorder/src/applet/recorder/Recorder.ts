import {desktopCapturer, remote} from "electron";
import {v4 as uuid} from "uuid";
import Path from "path";
import {Recording} from "./Recording";
import {promises as FS} from "fs";
import {IScreenshotConfig} from "./_types/IScreenshotConfig";
import Jimp from "jimp";
import {getTempPath} from "./getTempPath";
import {IWindowTitle} from "./_types/IWindowTitle";
import {IDataRetriever} from "model-react";
import {IRect} from "../overlays/window/_types/IRect";
import {IRecordingConfig} from "./_types/IRecordingConfig";

/** A class used to create and manage video recordings */
export class Recorder {
    protected hasQuit: IDataRetriever<boolean>;
    protected streams: Record<
        string,
        {
            stream: MediaStream;
            recordings: Recording[];
        }
    > = {};

    /**
     * Creates a new recorder
     * @param config The configuration data
     */
    constructor({
        hasQuit,
    }: {
        /** Whether the recording should be stopped */
        hasQuit: IDataRetriever<boolean>;
    }) {
        this.hasQuit = hasQuit;
    }

    /**
     * Checks whether this session is still running and throws an error if not
     */
    public checkRunning(): void {
        if (this.hasQuit()) throw new Error("Recording was (forcefully) exited");
    }

    // LaunchMenu capturing
    /**
     * Starts recording the LM window
     * @param path The output path
     * @param config Extra recording configuration
     * @returns The created recording
     */
    public async recordLM(
        path: string,
        config: {padding?: {x: number; y: number}} & IRecordingConfig = {}
    ): Promise<Recording> {
        this.checkRunning();
        const {id, crop} = await this.getLMCaptureData(config);
        return this.record(path, id, {...config, crop}, 1e4);
    }

    /**
     * Takes a screenshot of LM and saves to file
     * @param path The path to store the image at
     * @param config Some optional additional configuration
     */
    public async screenshotLM(
        path: string,
        config: {padding?: {x: number; y: number}} & IScreenshotConfig = {}
    ): Promise<void> {
        this.checkRunning();
        const {id, crop} = await this.getLMCaptureData(config);
        return this.screenshot(path, id, {...config, crop});
    }

    /**
     * Retrieves the LM capture data
     * @param config The configuration for padding
     * @returns The id
     */
    protected async getLMCaptureData({
        crop,
        padding,
    }: {
        crop?: IRect;
        padding?: {x: number; y: number};
    }): Promise<{id: string; crop?: IRect}> {
        const window = remote.getCurrentWindow();
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

        // Update the window title to connect it with the window
        const oldTitle = window.getTitle();
        const ID = uuid();
        window.setTitle(ID);

        // Find the source
        const sources = await desktopCapturer.getSources({types: ["window"]});
        const LMSource = sources.find(source => source.name == ID);
        window.setTitle(oldTitle);

        if (!LMSource) throw new Error("LM window could not be found!");
        return {id: LMSource.id, crop};
    }

    // Screen capturing
    /**
     * Starts recording a display
     * @param path The output path
     * @param config Additional configuration
     * @returns The created recording
     */
    public async recordScreen(
        path: string,
        config: {
            /** A coordinate that should be within the display to be recorded */
            displayPoint?: {x: number; y: number};
        } & IRecordingConfig = {}
    ): Promise<Recording> {
        this.checkRunning();
        return this.record(path, await this.getScreenId(config), config, 2e6);
    }

    /**
     * Takes a screenshot and saves to file
     * @param path The output path
     * @param config Additional configuration
     */
    public async screenshotScreen(
        path: string,
        config: {
            /** A coordinate that should be within the display to be recorded */
            displayPoint?: {x: number; y: number};
        } & IScreenshotConfig
    ): Promise<void> {
        this.checkRunning();
        return this.screenshot(path, await this.getScreenId(config), config);
    }

    /**
     * Retrieves the id of the screen to record according to the specified config
     * @param config The configuration to obtain the screen
     * @returns THe id of the source
     */
    protected async getScreenId({
        displayPoint: point = {x: 10, y: 10},
    }: {
        displayPoint?: {x: number; y: number};
    }): Promise<string> {
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
        return displaySource.id;
    }

    // Random window capturing
    /**
     * Starts recording of an arbitrary window
     * @param path The output path
     * @param windowTitle The title of the window to be recorded
     * @param config Extra recording configuration
     * @returns The created recording
     */
    public async recordWindow(
        path: string,
        windowTitle: IWindowTitle,
        config: IRecordingConfig
    ): Promise<Recording> {
        this.checkRunning();
        return this.record(path, await this.getWindowId(windowTitle), config, 1e4);
    }

    /**
     * Takes a screenshot of a window and saves to file
     * @param path The output path
     * @param windowTitle The title of the window to be screenshot
     * @param config Extra screenshot configuration
     */
    public async screenshotWindow(
        path: string,
        windowTitle: IWindowTitle,
        config: IScreenshotConfig
    ): Promise<void> {
        this.checkRunning();
        return this.screenshot(path, await this.getWindowId(windowTitle), config);
    }

    /**
     * Retrieves the stream source id for a given window
     * @param windowTitle The title of the window to find
     * @returns The stream id
     */
    protected async getWindowId(windowTitle: IWindowTitle): Promise<string> {
        // Find the source
        const sources = await desktopCapturer.getSources({types: ["window"]});
        const title =
            windowTitle instanceof Function ? await windowTitle(sources) : windowTitle;
        const windowSource = sources.find(source => source.name == title);

        if (!windowSource) throw new Error("Window could not be found!");
        return windowSource.id;
    }

    // Core recording and screenshot setup
    /**
     * Records the source with the given id
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
        const {stream, recordings} = await this.getStream(id);

        // Create the recording
        const recording: Recording = new Recording(path, stream, {
            ...config,
            defaultBitRate,
            onStop: () => this.closeStream(id, recording),
        });

        recordings.push(recording);
        return recording;
    }

    /**
     * Takes a screenshot of the given id
     * @param path The path to store the image at
     * @param id The if of the source to capture
     * @param config Additional screenshot configuration
     */
    protected async screenshot(
        path: string,
        id: string,
        {crop}: IScreenshotConfig = {}
    ): Promise<void> {
        console.log("Saving screenshot");
        try {
            const {stream} = await this.getStream(id);

            const postProcess = !!crop;
            const screenshotPath = postProcess ? getTempPath(uuid(), true) : path;

            // Capture an image from the stream
            const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
            const bitmap = await imageCapture.grabFrame();

            // Convert picture to file
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext("2d");
            context?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

            const frame = await new Promise<Blob | null>(res => canvas.toBlob(res));
            if (!frame) throw new Error("Unable to capture screenshot!");

            const buffer = Buffer.from(await frame.arrayBuffer());
            await FS.writeFile(screenshotPath, buffer);

            // Post process screenshot if needed
            if (postProcess) {
                try {
                    let image = await Jimp.read(screenshotPath);
                    if (crop) image = image.crop(crop.x, crop.y, crop.width, crop.height);
                    await image.writeAsync(path);
                } finally {
                    FS.unlink(screenshotPath);
                }
            }

            // Cleanup the stream
            this.closeStream(id);
            console.log(`Picture saved at "${path}"`);
        } catch (e) {
            console.error("Screenshotting failed!");
            throw e;
        }
    }

    /**
     * Retrieves the stream for a given id
     * @param id The stream to be retrieved
     * @returns The stream and the recordings for the stream
     */
    protected async getStream(
        id: string
    ): Promise<{stream: MediaStream; recordings: Recording[]}> {
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
        return this.streams[id];
    }

    /**
     * Disposes the stream for a given id, if it has no more recordings
     * @param id The id of the media stream to close
     * @param recording The recording to be closed
     */
    protected closeStream(id: string, recording?: Recording): void {
        const data = this.streams[id];
        if (!data) return;

        data.recordings = data.recordings.filter(rec => rec != recording);
        if (data.recordings.length == 0) {
            delete this.streams[id];
            data.stream.getTracks().forEach(track => track.stop());
        }
    }

    // Recording controls
    /**
     * Stops all video recordings
     */
    public async stop(): Promise<void> {
        try {
            const promises = Object.values(this.streams).flatMap(({recordings}) =>
                recordings.map(recording => recording.stop())
            );
            await Promise.all(promises);
        } finally {
            Object.values(this.streams).forEach(({stream}) =>
                stream.getTracks().forEach(track => track.stop())
            );
        }
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
