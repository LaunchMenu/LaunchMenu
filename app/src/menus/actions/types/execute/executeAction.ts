import {Action} from "../../Action";
import {IExecutable} from "./_types/IExecutable";

/**
 * The default execute action of any menu item
 */
export const executeAction = new Action((executors: IExecutable[]) => {
    return {
        execute: () => executors.forEach(executable => executable.execute()),
    } as IExecutable;
});
