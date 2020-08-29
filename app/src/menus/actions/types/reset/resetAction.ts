import {Action} from "../../Action";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {createContextAction} from "../../contextAction/createContextAction";
import {IContextActionResult} from "../../contextAction/_types/IContextActionResult";
import {IResetable} from "./_types/IResetable";
import {IContextExecuteData} from "../../../../context/_types/IContextExecuteData";

/**
 * The default reset action of any menu item
 */
export const resetAction = new Action(
    createContextAction(
        (executors: IResetable[]): IContextActionResult => {
            return {
                execute: async (data: IContextExecuteData) => {
                    const results = await Promise.all(
                        executors.map(executable => executable.reset(data))
                    );
                    const commands = results.filter(Boolean) as ICommand[];
                    if (commands.length > 0)
                        return new CompoundCommand({name: "Execute"}, commands);
                },
            };
        },
        {name: "Reset"}
    )
);
