import {Action} from "../../Action";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {createContextAction} from "../../contextAction/createContextAction";
import {IExecutable} from "../execute/_types/IExecutable";

/**
 * The default delete action of any menu item
 */
export const deleteAction = new Action(
    createContextAction(
        (executors: IExecutable[]) => {
            return {
                execute: async () => {
                    const results = await Promise.all(
                        executors.map(executable => executable.execute())
                    );
                    const commands = results.filter(Boolean) as ICommand[];
                    if (commands.length > 0)
                        return new CompoundCommand({name: "Execute"}, commands);
                },
            } as IExecutable;
        },
        {name: "Delete"}
    )
);
