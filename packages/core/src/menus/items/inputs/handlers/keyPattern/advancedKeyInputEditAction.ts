import {IAdvancedKeyInputExecuteData} from "./_types/IAdvancedKeyInputExecuteData";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {CompoundCommand} from "../../../../../undoRedo/commands/CompoundCommand";
import {SetFieldCommand} from "../../../../../undoRedo/commands/SetFieldCommand";
import {AdvancedKeyPatternUI} from "./AdvancedKeyPatternUI";
import {createContextAction} from "../../../../../actions/contextMenuAction/createContextAction";
import {Priority} from "../../../../menu/priority/Priority";
import {IExecutable} from "../../../../../actions/types/execute/_types/IExecutable";

/**
 * An action to let users update key inputs
 */
export const advancedKeyInputEditAction = createContextAction({
    name: "Open advanced editor",
    contextItem: {
        priority: [Priority.HIGH, 40],
    },
    core: (data: IAdvancedKeyInputExecuteData[]) => {
        const execute: IExecutable = async ({context}) => {
            const cmds = [] as ICommand[];
            for (const {field, undoable, liveUpdate, globalShortcutOnly} of data) {
                await new Promise<void>(res => {
                    context.open(
                        new AdvancedKeyPatternUI(field, {
                            onSubmit: result => {
                                if (undoable)
                                    cmds.push(new SetFieldCommand(field, result));
                                else if (!liveUpdate) field.set(result);
                            },
                            globalShortcutOnly,
                        }),
                        {onClose: res}
                    );
                });
            }

            if (cmds.length > 0)
                return new CompoundCommand({name: "Key patterns updates"}, cmds);
        };
        return {
            execute,
            result: {execute},
        };
    },
});
