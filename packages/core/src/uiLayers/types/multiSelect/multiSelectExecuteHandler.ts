import {createAction, createStandardBinding} from "../../../actions/createAction";
import {sequentialExecuteHandler} from "../../../actions/types/execute/sequentialExecuteHandler";
import {IExecutable} from "../../../actions/types/execute/_types/IExecutable";
import {IAction} from "../../../actions/_types/IAction";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {IBindingCreatorConfig} from "../../../actions/_types/IBindingCreator";
import {TPureAction} from "../../../actions/_types/TPureAction";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {MultiSelect} from "./MultiSelect";
import {IMultiSelectExecuteData} from "./_types/IMultiSelectExecuteData";

/**
 * A handler to let users alter a field with multiple values given a selection of options
 */
export const multiSelectExecuteHandler = createAction({
    name: "multi select handler",
    parents: [sequentialExecuteHandler],
    core: (data: IMultiSelectExecuteData<unknown>[]) => ({
        children: data.map(({field, undoable, ...config}) =>
            sequentialExecuteHandler.createBinding({
                execute: ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new MultiSelect(field, {
                                ...config,
                                onSubmit: undoable
                                    ? result => {
                                          cmd = new SetFieldCommand(field, result);
                                      }
                                    : undefined,
                            }),
                            () => {
                                res(cmd);
                            }
                        );
                    }),
            })
        ),
    }),
    createBinding: createStandardBinding as {
        /**
         * Creates a new action binding
         * @param config The data for the binding, and optionally extra configuration
         * @returns The created binding
         */
        <T>(
            config:
                | IMultiSelectExecuteData<T>
                | IBindingCreatorConfig<IMultiSelectExecuteData<T>>
        ): IActionBinding<IAction<IMultiSelectExecuteData<unknown>, never>>;
    },
});
