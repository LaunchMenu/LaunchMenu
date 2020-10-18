import {IAdvancedKeyInputExecuteData} from "./_types/IAdvancedKeyInputExecuteData";
import {Action} from "../../../../actions/Action";
import {createContextAction} from "../../../../actions/contextAction/createContextAction";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {CompoundCommand} from "../../../../../undoRedo/commands/CompoundCommand";
import {SetFieldCommand} from "../../../../../undoRedo/commands/SetFieldCommand";
import {IIOContext} from "../../../../../context/_types/IIOContext";
import {AdvancedKeyPatternUI} from "./AdvancedKeyPatternUI";

/**
 * An action to let users update key inputs
 */
export const advancedKeyInputEditAction = new Action(
    createContextAction(
        (data: IAdvancedKeyInputExecuteData[]) => ({
            execute: async ({context}: {context: IIOContext}) => {
                const cmds = [] as ICommand[];
                for (const {field, undoable, liveUpdate} of data) {
                    await new Promise(res => {
                        context.open(
                            new AdvancedKeyPatternUI(field, {
                                onSubmit: result => {
                                    if (undoable)
                                        cmds.push(new SetFieldCommand(field, result));
                                    else if (!liveUpdate) field.set(result);
                                },
                            }),
                            res
                        );
                    });
                }

                if (cmds.length > 0)
                    return new CompoundCommand({name: "Key patterns updates"}, cmds);
            },
        }),
        {name: "Open advanced editor"}
    )
);
