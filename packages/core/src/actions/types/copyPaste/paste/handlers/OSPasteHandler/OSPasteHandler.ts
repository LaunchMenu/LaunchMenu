import {cmdModifier} from "../../../../../../utils/platform/cmdModifier";
import {createAction} from "../../../../../createAction";
import {sendOSKeys} from "../../../sendKeys/sendOSKeys";
import {pasteExecuteHandler} from "../../pasteExecuteHandler";

/** A paste execute handler that sends a command to the operating system to paste the current clipboard */
export const OSPasteHandler = createAction({
    name: "OS native paste",
    parents: [pasteExecuteHandler],
    core: (data: void[]) => {
        const paste = () => sendOSKeys([{key: "v", modifiers: [cmdModifier]}]);
        return {
            result: {
                /** Sends an OS paste command  */
                paste,
            },
            children: [pasteExecuteHandler.createBinding(paste)],
        };
    },
});
