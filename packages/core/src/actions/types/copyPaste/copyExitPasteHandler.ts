import {createAction, createStandardBinding} from "../../createAction";
import {addBindingCreatorRequirement} from "../../utils/addBindingCreatorRequirement";
import {addBindingRequirement} from "../../utils/addBindingRequirement";
import {adjustBindingInput} from "../../utils/adjustBindingInput";
import {IActionBinding} from "../../_types/IActionBinding";
import {IBindingCreatorConfig} from "../../_types/IBindingCreator";
import {executeAction} from "../execute/executeAction";
import {copyExecuteHandler} from "./copy/copyExecuteHandler";
import {copyTextHandler} from "./copy/handlers/copyTextHandler";

/** A copy execute handler that uses electron's clipboard */
export const copyExitPasteHandler = addBindingCreatorRequirement(
    createAction({
        name: "Clipboard copy",
        parents: [executeAction],
        core: (data: IActionBinding[]) => {
            return {};
            // return {
            //     children: [data],
            // };
        },

        /**
         * Creates a binding for the copy exit paste handler, this can either be a string to copy, or any other  binding for the copy execute handler.
         * @param config
         */
        createBinding: function (
            config:
                | IActionBinding
                | string
                | IBindingCreatorConfig<IActionBinding | string>
        ) {
            return createStandardBinding.call(
                this,
                adjustBindingInput(config, data => {
                    if (typeof data == "string")
                        return copyTextHandler.createBinding(data);
                    return data;
                })
            );
        },
    }),
    copyTextHandler
);
