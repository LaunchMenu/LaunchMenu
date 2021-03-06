import {IExecuteArg} from "../execute/_types/IExecuteArg";
import {Priority} from "../../../menus/menu/priority/Priority";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {createContextAction} from "../../contextMenuAction/createContextAction";
import {IDeletable} from "./_types/IDeletable";

/**
 * The default delete action of any menu item
 */
export const deleteAction = createContextAction({
    name: "Delete",
    contextItem: {
        priority: [Priority.LOW, Priority.MEDIUM + 5],
        icon: "delete",
    },
    core: (executors: IDeletable[]) => {
        const execute = async (data: IExecuteArg) => {
            const results = await Promise.all(
                executors.map(executable => executable(data))
            );
            const commands = results.filter(Boolean) as ICommand[];
            if (commands.length > 0)
                return new CompoundCommand({name: "Execute"}, commands);
        };
        return {
            execute,
            result: {delete: execute},
        };
    },
});
