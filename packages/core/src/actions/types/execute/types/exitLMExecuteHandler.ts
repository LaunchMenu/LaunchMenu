import {IIOContext} from "../../../../context/_types/IIOContext";
import {createAction} from "../../../createAction";
import {IExecutableFunction} from "../_types/IExecutable";
import {IExitLMExecuteData} from "./_types/IExitLMExecuteData";

/** An execute handler that can be used to exit LM, execute a callback, an */
export const exitLMExecuteHandler = createAction({
    name: "Exit Launchmenu",
    core: (onExit: IExitLMExecuteData[]) => {
        const execute: IExecutableFunction = ({context}) => {
            let reopen = onExit.some(
                item => item && !(item instanceof Function) && item.reopen
            );
            let forceClose = onExit.some(
                item => item && !(item instanceof Function) && item.forceClose
            );
            const executing = onExit.map(data => {
                if (data instanceof Function) return data({context});
                // else
            });
        };
        return {};
    },
});
