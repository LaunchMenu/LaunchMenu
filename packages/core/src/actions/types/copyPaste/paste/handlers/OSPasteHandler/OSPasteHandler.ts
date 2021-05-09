import {isPlatform} from "../../../../../../utils/ isPlatform";
import {createAction} from "../../../../../createAction";
import {sendOSKeys} from "../../../sendKeys/sendOSKeys";
import {pasteExecuteHandler} from "../../pasteExecuteHandler";

/** A paste execute handler that sends a command to the operating system to paste the current clipboard */
export const OSPasteHandler = createAction({
    name: "OS native paste",
    parents: [pasteExecuteHandler],
    core: (data: void[]) => {
        const paste = () =>
            sendOSKeys([{key: "v", modifiers: isPlatform("mac") ? ["meta"] : ["ctrl"]}]);
        return {
            result: {
                /** Sends an OS paste command  */
                paste,
            },
            children: [pasteExecuteHandler.createBinding(paste)],
        };
    },
});
