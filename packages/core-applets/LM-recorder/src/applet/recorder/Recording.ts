import {v4 as uuid} from "uuid";
import {promises as FS, existsSync} from "fs";
import Path from "path";
import FFmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import {IAudioConfig} from "./_types/IAudioConfig";
import {getTempPath} from "./getTempPath";
import {IExtendedRecordingConfig} from "./_types/IExtendedRecordingConfig";
import {IRecordingConfig} from "./_types/IRecordingConfig";
import {IVideoTimestampTags} from "./_types/IVideoTimestampTags";

/**
 * Represents an individual recording
 */
export class Recording {
    protected path: string;
    protected stream: MediaStream;
    protected config: IExtendedRecordingConfig;

    protected audio: ({
        /** The path to the audio */
        path: string;
        /* *The time to play the audio at */
        time: number;
    } & IAudioConfig)[] = [];

    protected timestampTags: IVideoTimestampTags = {};

    protected recorder: MediaRecorder;
    protected startTime: number;

    protected canceled = false;
    protected finished: Promise<void>;

    /**
     * Creates a new recording for the given stream at the given path
     * @param path The path to store the recording at once complete
     * @param stream The stream to be recorded
     * @param config Additional recording configuration
     */
    public constructor(
        path: string,
        stream: MediaStream,
        config: IExtendedRecordingConfig
    ) {
        this.path = path;
        this.stream = stream;
        this.config = config;
        this.startRecording();
    }

    /**
     * Pauses video recording
     */
    public pause(): void {
        this.checkRunning();
        this.recorder.pause();
    }

    /**
     * Resumes video recording when paused
     */
    public resume(): void {
        this.checkRunning();
        this.recorder.resume();
    }

    /**
     * Stops video recording
     */
    public stop(): Promise<void> {
        this.checkRunning();
        this.recorder.stop();
        return this.finished;
    }

    /**
     * Cancels video recording
     */
    public cancel(): void {
        this.checkRunning();
        this.canceled = true;
        this.recorder.stop();
    }

    /**
     * Checks whether this session is still running and throws an error if not
     */
    protected checkRunning(): void {
        this.config.checkRunning?.();
    }

    /**
     * Adds the given audio segment at this point in time of the recording
     * @param path The path to the audio file
     * @param config The configuration of the audio
     */
    public addAudio(path: string, config?: IAudioConfig): void {
        const absPath = Path.resolve(path);
        if (!existsSync(absPath))
            throw Error(`No file could be found at path "${path}"!`);
        this.audio.push({
            path: absPath,
            time: Date.now() - this.startTime,
            ...config,
        });
    }

    /**
     * Tags the current timestamp with the given path
     * @param tag The tag to add, a `.` (dot) can be used to make sub-objects
     */
    public tagTime(tag: string): void {
        const parts = tag.split(".");
        let obj = this.timestampTags;
        while (parts.length > 1) {
            const first = parts.shift();
            if (!first) return;
            let subObj = obj[first];
            if (!subObj || !(subObj instanceof Object)) subObj = obj[first] = {};

            obj = subObj;
        }

        const tagProp = parts.shift();
        if (!tagProp) return;
        obj[tagProp] = (Date.now() - this.startTime) / 1000;
    }

    /**
     * Saves the timestamps to a json file
     * @param path The path to save the timestamps to
     */
    public saveTimestamps(path?: string): Promise<void> {
        const {dir, name} = Path.parse(path ?? this.path);
        const jsonPath = Path.join(dir, name) + (!path ? " timestamps" : "") + ".json";

        return FS.writeFile(jsonPath, JSON.stringify(this.timestampTags, null, 4));
    }

    /**
     * Starts recording of LM
     */
    protected startRecording(): void {
        const type = "video/webm; codecs=vp8,opus";
        this.recorder = new MediaRecorder(this.stream, {mimeType: type});

        // Handle saving on stop
        const recordedChunks: Blob[] = [];
        let finish: () => void;
        let reject: (error: any) => void;
        this.finished = new Promise<void>((res, rej) => {
            finish = res;
            reject = rej;
        });
        this.recorder.ondataavailable = e => recordedChunks.push(e.data);
        this.recorder.onstop = async () => {
            this.config.onStop?.();
            if (this.canceled) {
                finish();
                return;
            }

            console.log("Saving video");
            try {
                // Determine the intermediate paths if needed
                const addAudio = this.audio.length != 0;
                const audioPath = addAudio ? getTempPath(uuid()) : this.path;

                const postProcess = this.config.bitRate || this.config.crop;
                const renderPath = postProcess ? getTempPath(uuid()) : audioPath;

                // Render the video from js
                const blob = new Blob(recordedChunks, {type});
                const buffer = Buffer.from(await blob.arrayBuffer());
                await FS.writeFile(renderPath, buffer);

                // Crop the video using ffmpeg if needed for cropping or other processing
                if (postProcess)
                    await this.processVideo(renderPath, audioPath, {
                        bitRate: this.config.defaultBitRate,
                        ...this.config,
                    });

                // Add audio to the video if needed
                if (addAudio) await this.addVideoAudio(audioPath, this.path);

                console.log(`Video saved at "${this.path}"`);

                finish();
            } catch (e) {
                console.error("Screen capturing failed!");
                reject(e);
            }
        };

        this.recorder.start();
        this.startTime = Date.now();
    }

    /**
     * Crops the video at the given path
     * @param inPath The path to the video to crop
     * @param outPath The path to store the video at
     * @param config The processing config
     */
    protected async processVideo(
        inPath: string,
        outPath: string,
        {crop, bitRate, crf}: IRecordingConfig
    ): Promise<void> {
        return new Promise<void>((res, rej) => {
            const video = FFmpeg({source: inPath})
                .setFfmpegPath(ffmpegPath)
                .addOption("-preset", "veryslow")
                .on("error", rej)
                .on("end", res);
            if (crf) video.addOption("-crf", `${crf}`);
            if (bitRate) video.videoBitrate(bitRate);
            if (crop)
                video.addOption(
                    "-filter:v ",
                    `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`
                );
            video.saveToFile(outPath);
        }).finally(() => {
            FS.unlink(inPath);
        });
    }

    /**
     * Adds audio to the given video
     * @param inPath The path to the video to add audio to
     * @param outPath The path to store the video at
     */
    protected async addVideoAudio(inPath: string, outPath: string): Promise<void> {
        return new Promise<void>((res, rej) => {
            const video = FFmpeg({source: inPath})
                .setFfmpegPath(ffmpegPath)
                .addOption("-c:v", "copy")
                .addOption("-map", `0`)
                .addOption("-map", `[audio]`)
                .on("error", rej)
                .on("end", res);

            this.audio.forEach(({path, time, offset}, i) => {
                video.addInput(path);
            });

            const audioSequences = this.audio.map(({time, offset, volume = 1}, i) => {
                const delay = (time + (offset ?? 0)).toFixed(0);
                return `[${
                    i + 1
                }:a]aresample=async=1,volume=${volume},adelay=${delay}|${delay}[${
                    i + 1
                }o]`;
            });
            const audioIds = this.audio.map(({}, i) => `[${i + 1}o]`).join("");
            const audioCombining = `${audioIds}amix=inputs=${this.audio.length}[audio]`;
            video.addOption(
                "-filter_complex",
                `${audioSequences.join(";")};${audioCombining}`
            );

            video.saveToFile(outPath);
        }).finally(() => {
            FS.unlink(inPath);
        });
    }
}
