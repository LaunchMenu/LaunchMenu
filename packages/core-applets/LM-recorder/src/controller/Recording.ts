import {v4 as uuid} from "uuid";
import {promises as fs} from "fs";
import OS from "os";
import Path from "path";
import FFmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import {IRecordingConfig} from "./_types/IRecordingConfig";
import {IExtendedRecordingConfig} from "./_types/IExtendedRecordingConfig";

/**
 * Represents an individual recording
 */
export class Recording {
    protected path: string;
    protected stream: MediaStream;
    protected config: IExtendedRecordingConfig;

    protected recorder: MediaRecorder;

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
            const postProcess = this.config.bitRate || this.config.crop;

            // Render the video from js
            const renderPath = postProcess ? this.getTempPath(uuid()) : this.path;
            const blob = new Blob(recordedChunks, {type});
            const buffer = Buffer.from(await blob.arrayBuffer());
            await fs.writeFile(renderPath, buffer);

            // Crop the video using ffmpeg if needed
            if (postProcess)
                await this.processVideo(renderPath, this.path, {
                    bitRate: this.config.defaultBitRate,
                    ...this.config,
                });

            console.log(`Video saved at "${this.path}"`);
            finish();
        };

        this.recorder.start();
    }

    /**
     * Crops the video at the given path
     * @param inPath The path to the video to crop
     * @param outPath The path to store the video at
     * @param crop
     */
    protected async processVideo(
        inPath: string,
        outPath: string,
        {crop, bitRate, crf}: IRecordingConfig
    ): Promise<void> {
        return new Promise((res, rej) => {
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
        });
    }

    /**
     * Retrieves a temp file path for a video
     * @param id The id of the vioeo
     */
    protected getTempPath(id: string): string {
        return Path.join(OS.tmpdir(), `${id}-video.webm`);
    }
}
