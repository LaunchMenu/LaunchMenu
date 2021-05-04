import {promises as FS} from "fs";
import {Field, IDataHook} from "model-react";

/** A class to manage audio recording */
export class AudioRecorder {
    protected inputDevice?: string;

    protected stream?: MediaStream;
    protected recordedChunks: Blob[] = [];
    protected recorder?: MediaRecorder;

    protected recording?: Promise<Blob>;
    protected playback?: HTMLAudioElement;

    protected recordingField = new Field(false);
    protected playbackTime = new Field(0);
    protected playingBackField = new Field(false);

    protected startTime = 0;
    protected stopTime = 0;

    /**
     * Creates a new video recorder
     * @param deviceID The iD of the input device to use for the recording
     */
    public constructor(deviceID?: string) {
        this.inputDevice = deviceID;
    }

    // Recording
    /**
     * Starts audio recording
     */
    public async start(): Promise<void> {
        if (this.stream) throw Error("Already recording");

        this.stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {deviceId: this.inputDevice ?? undefined},
        });

        this.recorder = new MediaRecorder(this.stream, {mimeType: "audio/webm"});
        this.recorder.ondataavailable = e => this.recordedChunks.push(e.data);
        this.recorder.start();
        this.recordingField.set(true);

        this.startTime = Date.now();
    }

    /**
     * Stops audio recording
     */
    public async stop(): Promise<void> {
        if (!this.recorder) throw Error("Can't stop before recording has started");
        const recorder = this.recorder;

        this.recording = new Promise<Blob>((res, rej) => {
            recorder.onerror = rej;
            recorder.onstop = async () => {
                res(new Blob(this.recordedChunks));
            };
        });
        this.stopTime = Date.now();
        this.recorder.stop();
        this.recordingField.set(false);

        await this.recording;
    }

    /**
     * Retrieves whether we're currently recording audio
     * @param hook The hook to subscribe to changes
     * @returns Whether recording
     */
    public isRecording(hook?: IDataHook): boolean {
        return this.recordingField.get(hook);
    }

    /**
     * Saves the recording to the given path
     * @param path The path to save the recording at
     */
    public async save(path: string): Promise<void> {
        if (!this.recording)
            throw Error("Can't save the recording before recording has finished.");

        const blob = await this.recording;
        const buffer = Buffer.from(await blob.arrayBuffer());
        await FS.writeFile(path, buffer);
    }

    // Playback
    /**
     * Starts playing back the recorded audio
     */
    public async playBack(): Promise<void> {
        if (!this.playback) {
            this.playback = document.createElement("audio");
            const audioURL = URL.createObjectURL(await this.recording);
            this.playback.src = audioURL;

            this.playback.currentTime = this.playbackTime.get();
            this.playback.ontimeupdate = () => {
                this.playbackTime.set(this.playback?.currentTime ?? 0);
            };
            this.playback.onplay = () => {
                this.playingBackField.set(true);
            };
            this.playback.onpause = () => {
                this.playingBackField.set(false);
            };
        }

        this.playback.play();
    }

    /**
     * Pauses audio playback
     */
    public pausePlayback(): void {
        if (this.playback) {
            this.playback.pause();
        }
    }

    /**
     * Stops audio playback
     */
    public stopPlayback(): void {
        if (this.playback) {
            this.playback.pause();
            URL.revokeObjectURL(this.playback.src);
            this.playback = undefined;
            this.setPlaybackTime(0);
        }
    }

    /**
     * Sets the time of the playback
     * @param time The time for the playback
     */
    public setPlaybackTime(time: number) {
        this.playbackTime.set(time);
        if (this.playback) this.playback.currentTime = time;
    }

    /**
     * Retrieves the current playback time
     * @param hook The hook to subscribe to changes
     * @returns The current playback time
     */
    public getPlaybackTime(hook?: IDataHook): number {
        return this.playbackTime.get(hook);
    }

    /**
     * Checks whether we're currently playing back the audio
     * @param hook The hook to subscribe to changes
     * @returns Whether audio is currently playing back
     */
    public isPlayingBack(hook?: IDataHook): boolean {
        return this.playingBackField.get(hook);
    }

    /**
     * Retrieves the duration of the recording
     * @returns The duration
     */
    public getDuration(): number {
        const duration = this.playback?.duration;
        return duration && duration < Infinity
            ? duration
            : (this.stopTime - this.startTime) / 1000;
    }

    // Utility
    /**
     * Retrieves all the available input devices
     * @returns The available microphones
     */
    public static async getAvailableMicrophones(): Promise<MediaDeviceInfo[]> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind == "audioinput");
    }
}
