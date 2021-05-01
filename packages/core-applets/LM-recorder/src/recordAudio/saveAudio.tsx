import React from "react";
import {
    adjustBindings,
    CenterBox,
    Content,
    createStandardMenuItem,
    FillBox,
    getControlsCategory,
    IIOContext,
    IMenuItem,
    isActionBindingFor,
    Menu,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import {settings} from "../settings";
import {promises as FS} from "fs";
import {AudioRecorder} from "./AudioRecorder";
import Path from "path";
import {v4 as uuid} from "uuid";
import {Field} from "model-react";
import {confirmExecuteHandler} from "./confirmExecuteHandler";
import {Blink} from "../components/Blink";

/**
 * Guides the user to saving the audio
 * @param context The context to open UI in
 * @param recorder The recorder that contains the audio to be saved
 */
export async function saveAudio(
    context: IIOContext,
    recorder: AudioRecorder
): Promise<void> {
    return new Promise(res => {
        context.open(new AudioSaverLayer({recorder}), {onClose: res});
    });
}

/**
 * A layer that can be used for saving of a recorded piece of audio
 */
export class AudioSaverLayer extends UILayer {
    protected recorder: AudioRecorder;
    protected search = new Field("");
    protected directory?: string;

    /**
     * Creates a new save layer
     * @param config Some optional configuration for the layer
     */
    public constructor({recorder}: {recorder: AudioRecorder}) {
        super(
            context => {
                this.directory = context.settings.get(settings).audioDir.get();

                const menu = new Menu(context, []);
                this.getReplaceItems().then(items =>
                    menu.addItems([...items, this.getCustomView()])
                );

                return {
                    menu,
                    contentView: {close: true},
                };
            },
            {path: "Save"}
        );

        this.recorder = recorder;
    }

    /**
     * Retrieves the items of previous recordings to be replaced
     * @returns The menu items representing existing recordings
     */
    protected async getReplaceItems(): Promise<IMenuItem[]> {
        if (!this.directory) return [];
        try {
            const files = await FS.readdir(this.directory);
            return files.map(file =>
                createStandardMenuItem({
                    name: Path.parse(file).name,
                    actionBindings: [
                        confirmExecuteHandler.createBinding({
                            actionMessage: "overwrite this file",
                            onConfirm: () => this.saveFile(file),
                        }),
                    ],
                })
            );
        } catch (e) {
            return [];
        }
    }

    /**
     * Retrieves the item to show for custom file input
     */
    protected getCustomView(): IMenuItem {
        return this.makeItemAlwaysShow(
            createStandardMenuItem({
                name: h =>
                    this.search.get(h)
                        ? "Save as new file: "
                        : "Enter name to save as new file",
                description: h =>
                    this.search.get(h) ? `"${this.search.get(h)}"` : undefined,
                category: getControlsCategory(),
                onExecute: () => {
                    const name = this.search.get();
                    if (name) this.saveFile(name + ".wav");
                },
            })
        );
    }

    /**
     * Saves the recording under the given name
     * @param name The name to save the file under
     */
    protected async saveFile(name: string): Promise<void> {
        if (!this.directory) throw Error("Layer must be opened in a context first!");
        const context = this.context.get();
        this.closeAll();

        const saving = this.recorder.save(Path.join(this.directory, name));
        if (context) {
            const savingLayer = new UILayer({
                content: new Content(
                    (
                        <CenterBox as={FillBox} color="primary" css={{fontSize: 50}}>
                            <Blink>Saving</Blink>
                        </CenterBox>
                    )
                ),
            });
            context.open(savingLayer);
            await saving;
            context.close(savingLayer);
        }

        await saving;
    }

    /**
     * Makes the specified item show up no matter what the search
     * @param item The item to modify
     * @returns The menu item with adjusted search action
     */
    protected makeItemAlwaysShow(item: IMenuItem): IMenuItem {
        // Create a search binding that returns this item no matter what the query
        const id = uuid();
        const searchBinding = searchAction.createBinding({
            ID: id,
            search: async query => {
                this.search.set(query.search);
                return {
                    // Note it should be resultItem, not item, since item doesn't contain all data yet
                    item: {
                        item: resultItem,
                        ID: id,
                        priority: 0.1,
                    },
                };
            },
        });

        // Return the item together with the new search action binding
        const resultItem = {
            view: item.view,
            actionBindings: adjustBindings(item.actionBindings, bindings => [
                ...bindings.filter(binding => !isActionBindingFor(searchAction, binding)),
                searchBinding,
            ]),
        };
        return resultItem;
    }
}
