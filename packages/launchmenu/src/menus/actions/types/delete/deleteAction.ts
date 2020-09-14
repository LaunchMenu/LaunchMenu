import {Action} from "../../Action";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {createContextAction} from "../../contextAction/createContextAction";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IContextActionResult} from "../../contextAction/_types/IContextActionResult";
import {IDeletable} from "./_types/IDeletable";
import {IContextExecuteData} from "../../../../context/_types/IContextExecuteData";

/**
 * The default delete action of any menu item
 */
export const deleteAction = new Action(
    createContextAction(
        (executors: IDeletable[]): IContextActionResult => {
            return {
                execute: async (data: IContextExecuteData) => {
                    const results = await Promise.all(
                        executors.map(executable => executable.delete(data))
                    );
                    const commands = results.filter(Boolean) as ICommand[];
                    if (commands.length > 0)
                        return new CompoundCommand({name: "Execute"}, commands);
                },
            };
        },
        {name: "Delete"}
    )
);
