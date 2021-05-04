import React from "react";
import {
    Box,
    createStandardMenuItem,
    FillBox,
    IIOContext,
    IMenuItem,
    IViewStackItemView,
    Menu,
    UILayer,
} from "@launchmenu/core";
import {AudioRecorder} from "./AudioRecorder";
import {IReviewResult} from "./_types/IReviewResult";
import {Loader} from "model-react";

/**
 * Guides the user to check their recording
 * @param context The context to open UI in
 * @param recorder The recorder that contains the audio to check
 * @returns How to continue the process
 */
export async function reviewAudio(
    context: IIOContext,
    recorder: AudioRecorder
): Promise<IReviewResult> {
    const layer = new AudioReviewLayer({recorder});
    context.open(layer);
    return layer.result;
}

/**
 * A layer that can be used for saving of a recorded piece of audio
 */
export class AudioReviewLayer extends UILayer {
    public result: Promise<IReviewResult>;
    protected resolve: (result: IReviewResult) => void;

    protected recorder: AudioRecorder;

    /**
     * Creates a new review layer
     * @param config Some optional configuration for the layer
     */
    public constructor({recorder}: {recorder: AudioRecorder}) {
        super(
            context => {
                return {
                    menu: new Menu(context, [
                        this.getPlaybackItem(),
                        this.getSaveItem(),
                        this.getRerecordItem(),
                    ]),
                    contentView: this.getContent(),
                    onClose: () => {
                        this.recorder.stopPlayback();
                        this.resolve({});
                    },
                };
            },
            {path: "Review"}
        );

        this.recorder = recorder;
        this.result = new Promise(res => (this.resolve = res));
    }

    /**
     * Retrieves the view to show in the content area
     */
    protected getContent(): IViewStackItemView {
        return (
            <FillBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                color="primary"
                css={{fontSize: 50}}>
                <Loader>
                    {h => (
                        <Box>
                            Duration: {Math.round(this.recorder.getDuration())}s
                            <Box background="tertiary">
                                <Box
                                    height={5}
                                    width={`${Math.floor(
                                        (100 * this.recorder.getPlaybackTime(h)) /
                                            this.recorder.getDuration()
                                    )}%`}
                                    background="primary"
                                />
                            </Box>
                        </Box>
                    )}
                </Loader>
            </FillBox>
        );
    }

    /**
     * Retrieves the menu item used to control audio playback
     * @returns The menu item
     */
    protected getPlaybackItem(): IMenuItem {
        return createStandardMenuItem({
            name: "Play/pause",
            onExecute: async () => {
                if (!this.recorder.isPlayingBack()) this.recorder.playBack();
                else this.recorder.pausePlayback();
            },
        });
    }

    /**
     * Retrieves the menu item that can be used to stop the recording
     * @returns The menu item
     */
    protected getSaveItem(): IMenuItem {
        return createStandardMenuItem({
            name: "Save",
            onExecute: async () => {
                this.closeAll();
                this.resolve({save: true});
            },
        });
    }

    /**
     * Retrieves the menu item that can be used to cancel the recording
     * @returns The menu item
     */
    protected getRerecordItem(): IMenuItem {
        return createStandardMenuItem({
            name: "Rerecord",
            onExecute: async () => {
                this.closeAll();
                this.resolve({rerecord: true});
            },
        });
    }
}
