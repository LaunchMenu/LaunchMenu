import {createAction, createStandardBinding} from "../../../actions/createAction";
import {sequentialExecuteHandler} from "../../../actions/types/execute/sequentialExecuteHandler";
import {IAction} from "../../../actions/_types/IAction";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {IBindingCreatorConfig} from "../../../actions/_types/IBindingCreator";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {Select} from "./Select";
import {ISelectExecuteData} from "./_types/ISelectExecuteData";

/**
 * A handler to let users alter a field given a selection of options
 */
export const selectExecuteHandler = createAction({
    name: "select execute handler",
    parents: [sequentialExecuteHandler],
    core: (data: ISelectExecuteData<unknown>[]) => ({
        children: data.map(({field, undoable, ...config}) =>
            sequentialExecuteHandler.createBinding(
                ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new Select(field, {
                                ...config,
                                onSubmit: undoable
                                    ? result => {
                                          cmd = new SetFieldCommand(field, result);
                                      }
                                    : undefined,
                            }),
                            {
                                onClose: () => {
                                    res(cmd);
                                },
                            }
                        );
                    })
            )
        ),
    }),
    createBinding: createStandardBinding as {
        /**
         * Creates a new action binding
         * @param config The data for the binding, and optionally extra configuration
         * @returns The created binding
         */
        <T>(
            config: ISelectExecuteData<T> | IBindingCreatorConfig<ISelectExecuteData<T>>
        ): IActionBinding<IAction<ISelectExecuteData<unknown>, never>>;
    },
});
