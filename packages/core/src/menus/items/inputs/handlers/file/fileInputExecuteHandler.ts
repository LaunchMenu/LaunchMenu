import {remote} from "electron";
import {createAction} from "../../../../../actions/createAction";
import {IFileInputExecuteData} from "./_types/IFileInputExecuteData";
import {SetFieldCommand} from "../../../../../undoRedo/commands/SetFieldCommand";
import {editExecuteHandler} from "../../../../../actions/types/execute/types/editExecuteHandler";

/**
 * A simple execute handler for updating file fields
 * TODO: Add some way of configuring this handler, such that a file explorer applet can take over this task
 */
export const fileInputExecuteHandler = createAction({
    name: "file input",
    parents: [editExecuteHandler],
    core: (data: IFileInputExecuteData[]) => ({
        children: data.map(({field, folder, undoable}) =>
            editExecuteHandler.createBinding(async ({context}) => {
                const {LM} = context.session || {};

                // Counteract keys not being released when losing focus, TODO: fix having to do this
                LM?.getKeyHandler().resetKeys();

                const result = await remote.dialog.showOpenDialog({
                    properties: [folder ? "openDirectory" : "openFile"],
                    defaultPath: field.get(),
                });
                const path = result.filePaths[0];
                if (!result.canceled && path) {
                    if (undoable) return new SetFieldCommand(field, path);
                    field.set(path);
                }

                // Open LM after losing focus again
                LM?.setWindowOpen(true);
            })
        ),
    }),
});
