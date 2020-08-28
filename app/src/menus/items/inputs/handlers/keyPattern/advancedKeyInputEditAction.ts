import {IAdvancedKeyInputExecuteData} from "./_types/IAdvancedKeyInputExecuteData";
import {Action} from "../../../menus/actions/Action";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {createContextAction} from "../../../menus/actions/contextAction/createContextAction";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {openUI} from "../../../context/openUI/openUI";
import {AdvancedKeyPatternMenu} from "./AdvancedKeyPatternMenu";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";

/**
 * An action to let users update key inputs
 */
export const advancedKeyInputEditAction = new Action(
    createContextAction(
        (data: IAdvancedKeyInputExecuteData[]) => ({
            execute: async () => {
                const cmds = [] as ICommand[];
                for (const {context, field, liveUpdate, undoable} of data) {
                    await new Promise(res => {
                        const close = openUI(
                            context,
                            {
                                menu: new AdvancedKeyPatternMenu({
                                    context,
                                    field,
                                    liveUpdate,
                                    onFinish: result => {
                                        if (undoable)
                                            cmds.push(new SetFieldCommand(field, result));
                                        else if (!liveUpdate) field.set(result);
                                        close();
                                    },
                                }),
                            },
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
