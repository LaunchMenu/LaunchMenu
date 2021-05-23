import React from "react";
import {
    Box,
    CenterBox,
    createStandardMenuItem,
    FillBox,
    IIOContext,
    IMenuItem,
    IViewStackItemView,
    Menu,
    UILayer,
} from "@launchmenu/core";
import {Field, Loader} from "model-react";
import {AudioRecorder} from "./AudioRecorder";
import {Blink} from "../../components/Blink";

/**
 * Performs audio recording and results in a completed audio recorder if successful
 * @param context The context to open UI with
 */
export async function recordAudio(context: IIOContext): Promise<AudioRecorder | null> {
    const layer = new AudioRecorderLayer();
    context.open(layer);
    return layer.result;
}

/**
 * A layer that can be used for recording of audio
 */
export class AudioRecorderLayer extends UILayer {
    public result: Promise<AudioRecorder | null>;
    protected resolve: (result: AudioRecorder | null) => void;

    protected timeLeft = new Field(0);
    protected state = new Field<"starting" | "recording" | "finishing">("starting");
    protected recorder = new AudioRecorder();

    /**
     * Creates a new recorder layer
     * @param config Some optional configuration for the layer
     */
    public constructor({countdown = 3}: {countdown?: number} = {}) {
        super(
            context => {
                this.start();
                return {
                    menu: new Menu(context, [this.getStopItem(), this.getCancelItem()]),
                    contentView: this.getContent(),
                    onClose: () => {
                        // Cancel if exiting without explicitly canceling
                        if (this.recorder.isRecording()) {
                            this.recorder.stop();
                            this.resolve(null);
                        }
                    },
                };
            },
            {path: "Record"}
        );

        this.timeLeft.set(countdown);
        this.result = new Promise(res => (this.resolve = res));
    }

    /**
     * Retrieves the view to show in the content area
     */
    protected getContent(): IViewStackItemView {
        return (
            <CenterBox as={FillBox} color="primary" css={{fontSize: 50}}>
                <Loader>
                    {h => {
                        const time = this.timeLeft.get(h);
                        if (time > 0) return time;
                        const state = this.state.get(h);
                        return <Blink>{state}</Blink>;
                    }}
                </Loader>
            </CenterBox>
        );
    }

    /**
     * Starts the audio recording process
     */
    protected start(): void {
        const intervalID = setInterval(() => {
            const remaining = this.timeLeft.get() - 1;
            this.timeLeft.set(remaining);
            if (remaining <= 0) {
                clearInterval(intervalID);
                this.state.set("recording");
                this.recorder.start();
            }
        }, 1000);
    }

    /**
     * Retrieves the menu item that can be used to stop the recording
     * @returns The menu item
     */
    protected getStopItem(): IMenuItem {
        return createStandardMenuItem({
            name: "Stop",
            onExecute: async () => {
                this.closeAll();
                await this.recorder.stop();
                this.resolve(this.recorder);
            },
        });
    }

    /**
     * Retrieves the menu item that can be used to cancel the recording
     * @returns The menu item
     */
    protected getCancelItem(): IMenuItem {
        return createStandardMenuItem({
            name: "Cancel",
            onExecute: async () => {
                this.closeAll();
                await this.recorder.stop();
                this.resolve(null);
            },
        });
    }
}
