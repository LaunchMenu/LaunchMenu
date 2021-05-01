import {v4 as uuid} from "uuid";
import {promises as FS} from "fs";
import Path from "path";
import FFmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import {IAudioConfig} from "./_types/IAudioConfig";
import {getTempPath} from "./getTempPath";
import {IRecordingConfig} from "../_types/IRecordingConfig";
import {IExtendedRecordingConfig} from "../_types/IExtendedRecordingConfig";

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
    public checkRunning(): void {
        this.config.checkRunning?.();
    }

    /**
     * Adds the given audio segment at this point in time of the recording
     * @param path The path to the audio file
     * @param config The configuration of the audio
     */
    public addAudio(path: string, config?: IAudioConfig): void {
        this.audio.push({
            path: Path.resolve(path),
            time: Date.now() - this.startTime,
            ...config,
        });
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
        this.finished = new Promise<void>(res => {
            finish = res;
        });
        this.recorder.ondataavailable = e => recordedChunks.push(e.data);
        this.recorder.onstop = async () => {
            this.config.onStop?.();
            if (this.canceled) {
                finish();
                return;
            }

            console.log("Saving video");
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
