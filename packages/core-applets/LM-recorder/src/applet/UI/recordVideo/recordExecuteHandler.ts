import {
    createContextAction,
    executeAction,
    sequentialExecuteHandler,
} from "@launchmenu/core";
import {recordScript} from "../../recordScript";
import {IRecordScript} from "../../_types/IRecordScript";
import {activeRecordings} from "./watchRecordAction";
import {v4 as uuid} from "uuid";
import {Field} from "model-react";

/** The execute handler to record a video */
export const recordExecuteHandler = createContextAction({
    name: "Record video",
    parents: [sequentialExecuteHandler],
    contextItem: {
        priority: executeAction.priority,
        icon: "play",
    },
    override: executeAction,
    core: (scripts: IRecordScript[]) => {
        return {
            result: scripts,
            children: scripts.map(script =>
                sequentialExecuteHandler.createBinding(async ({context}) => {
                    const LM = context.session?.LM;
                    if (!LM) {
                        console.error("Context didn't contain a session");
                        return;
                    }

                    // Setup some global state data for the recording
                    let recordResult:
                        | Promise<{
                              forceQuit: () => void;
                              finished: Promise<void>;
                          }>
                        | undefined;
                    const isRecording = new Field(true);
                    const recording = {
                        name: uuid(),
                        isRecording,
                        dispose: () => recordResult?.then(({forceQuit}) => forceQuit()),
                    };
                    activeRecordings.set([...activeRecordings.get(), recording]);

                    // Perform the recording
                    try {
                        recordResult = recordScript({LM, script});
                        const {finished} = await recordResult;
                        await finished;
                    } finally {
                        // Dispose recording data
                        activeRecordings.set(
                            activeRecordings.get().filter(r => r != recording)
                        );
                    }
                })
            ),
        };
    },
});
