import {createContextAction} from "../../../../../contextMenuAction/createContextAction";
import {addBindingCreatorRequirement} from "../../../../../utils/addBindingCreatorRequirement";
import {IActionBinding} from "../../../../../_types/IActionBinding";
import {executeAction} from "../../../../execute/executeAction";
import {exitLMExecuteHandler} from "../../../../execute/types/exitLMExecuteHandler";
import {IExecuteArg} from "../../../../execute/_types/IExecuteArg";
import {pasteExecuteHandler} from "../../pasteExecuteHandler";
import {OSPasteHandler} from "./OSPasteHandler";

/**
 * An execute handler that exits LM and then pastes the clipboard contents
 * @remarks
 * Defaults to the OS paste handler if the binding doesn't specify a paste handler
 */
export const exitPasteHandler = addBindingCreatorRequirement(
    createContextAction({
        name: "Exit and paste",
        parents: [exitLMExecuteHandler],
        override: executeAction,
        core: (bindings: (void | IActionBinding)[]) => {
            /**
             * Executes the pasting of the data
             * @param data The context data
             */
            const executePaste = ({context}: Pick<IExecuteArg, "context">) =>
                executeAction.execute(context, [
                    {
                        actionBindings: bindings.map(b =>
                            !b ? OSPasteHandler.createBinding() : b
                        ),
                    },
                ]);

            const exitCallbackBinding = exitLMExecuteHandler.createBinding(executePaste);

            return {
                result: {
                    executePaste,
                    /**
                     * Exits LM and pastes the data
                     * @param data The context data
                     */
                    exitAndPaste: ({context}: IExecuteArg) =>
                        executeAction.execute(context, [
                            {actionBindings: [exitCallbackBinding]},
                        ]),
                },
                children: [exitCallbackBinding],
            };
        },
    }),
    pasteExecuteHandler
);
