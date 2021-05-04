import {
    createContextAction,
    executeAction,
    sequentialExecuteHandler,
} from "@launchmenu/core";
import {recordScript} from "../../recordScript";
import {IRecordScript} from "../../_types/IRecordScript";

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

                    await recordScript({LM, script});
                })
            ),
        };
    },
});
