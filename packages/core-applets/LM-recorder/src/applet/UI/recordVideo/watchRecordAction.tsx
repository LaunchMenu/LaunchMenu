import React from "react";
import {
    contextMenuAction,
    createContextAction,
    createStandardMenuItem,
    executeAction,
    Priority,
    wait,
} from "@launchmenu/core";
import hmr, {referencelessRequire} from "@launchmenu/hmr";
import {Field, IDataHook} from "model-react";
import {IWatchRecordData} from "./_types/IWatchRecordData";
import Path from "path";
import {recordScript} from "../../recordScript";
import {IRecordScriptDeclaration} from "./_types/IRecordScriptDeclaration";
import {videoScriptSymbol} from "./declareVideoScript";
import {settings} from "../../settings";

/** A context menu action to watch scripts for changes, and execute them when changed */
export const watchRecordAction = createContextAction({
    name: "Watch record script",
    contextItem: {
        priority: Priority.MEDIUM,
        content: (
            <>
                Starts watching for file changes affecting the given file and rerecords
                when updates occur.
                <br />
                <br />
                Watch mode can be exited from the context menu when not recording.
            </>
        ),
    },
    core: (scripts: IWatchRecordData[]) => ({
        actionBindings: scripts.map(({name, path, propName, watchDir}) =>
            executeAction.createBinding(({context}) => {
                const LM = context.session?.LM;
                if (!LM) {
                    console.error("Context didn't contain a session");
                    return;
                }
                if (!watchDir) watchDir = Path.dirname(path);

                // Setup the file watcher
                const isRecording = new Field(false);
                let prevDispose: () => Promise<void> = () => Promise.resolve();
                const watcher = hmr(watchDir, (changedFiles, affectedFiles) => {
                    if (affectedFiles.includes(path)) {
                        try {
                            const recordings = referencelessRequire(path);
                            const declaration = recordings[
                                propName
                            ] as IRecordScriptDeclaration | null;
                            const script = declaration?.script;
                            if (!script || declaration?.type != videoScriptSymbol) return;

                            // Record the script after disposing the previous iteration, and waiting for any other recordings to finish
                            const executingPrevRecording = executingRecording;
                            const recordResult = prevDispose().then(async () => {
                                await executingPrevRecording;
                                isRecording.set(true);
                                const result = await recordScript({LM, script});
                                return result;
                            });
                            recordResult
                                .then(({finished}) => finished)
                                .finally(() => isRecording.set(false));

                            // Make other recordings wait for this recording to finish, and setup the dispose function
                            let indicateForceFinish: (() => void) | undefined;
                            executingRecording = new Promise(res => {
                                // Resolve once execution finished
                                recordResult
                                    .then(({finished}) =>
                                        finished.catch(e => {
                                            console.error(e);
                                        })
                                    )
                                    .then(res);

                                // Allow for manual resolve
                                indicateForceFinish = res;
                            });
                            prevDispose = () =>
                                recordResult.then(({forceQuit}) => {
                                    forceQuit();
                                    wait(200).then(indicateForceFinish);
                                });
                        } catch (e) {
                            console.error(`Failed to load "${path}"`);
                            console.error(e);
                        }
                    }
                });

                // Track the recordings
                const scriptData = {
                    name,
                    isRecording,
                    dispose: () => {
                        watcher.destroy();
                        prevDispose();
                    },
                };
                const recordings = activeRecordings.get();
                if (!recordings.find(({name: rn}) => rn != name))
                    activeRecordings.set([...recordings, scriptData]);
            })
        ),
    }),
});

/** The recording that's currently being executed */
let executingRecording = Promise.resolve();

/** The recordings that are currently being watched */
export const activeRecordings = new Field<
    {name: string; isRecording: Field<boolean>; dispose: () => void}[]
>([]);

/** The binding to exit watched scripts */
const exitWatchBindings = contextMenuAction.createBinding({
    action: null,
    item: {
        priority: Priority.LOW,
        item: createStandardMenuItem({
            name: h => {
                const count = activeRecordings.get(h).length;
                return `Exit ${count} watched script${count != 1 ? "s" : ""}`;
            },
            onExecute: stopScriptWatchers,
            shortcut: (context, h) => context.settings.get(settings).exitWatchMode.get(h),
        }),
    },
    preventCountCategory: true,
});

/** A data retriever to check whether any recording is going */
export const isRecording = (hook?: IDataHook) => {
    const recordings = activeRecordings.get(hook);
    return recordings.some(({isRecording}) => isRecording.get(hook));
};

/**
 * Disposes all watched scripts
 */
export function stopScriptWatchers() {
    const scripts = activeRecordings.get();
    scripts.forEach(({dispose}) => dispose());
    activeRecordings.set([]);
}

/**
 * The context menu action binding to exit watched scripts
 * @param hook The hook to subscribe to changes
 * @returns The list with a binding when no script is executing, or an empty list otherwise
 */
export const globalExitBinding = (hook?: IDataHook) => {
    const visible = !isRecording(hook) && activeRecordings.get(hook).length > 0;
    return visible ? [exitWatchBindings] : [];
};
