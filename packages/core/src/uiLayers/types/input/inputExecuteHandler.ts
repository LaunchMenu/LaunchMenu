import {IInputExecuteData} from "./_types/IInputExecuteData";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {Input} from "./Input";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {createAction, createStandardBinding} from "../../../actions/createAction";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {IAction} from "../../../actions/_types/IAction";
import {IBindingCreatorConfig} from "../../../actions/_types/IBindingCreator";
import {editExecuteHandler} from "../../../actions/types/execute/types/editExecuteHandler";

/**
 * A handler to let users alter a field
 */
export const inputExecuteHandler = createAction({
    name: "input handler",
    parents: [editExecuteHandler],
    core: (data: IInputExecuteData<unknown>[]) => ({
        children: data.map(({field, undoable, ...config}) =>
            editExecuteHandler.createBinding(
                ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new Input(field, {
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
            config: IInputExecuteData<T> | IBindingCreatorConfig<IInputExecuteData<T>>
        ): IActionBinding<IAction<IInputExecuteData<unknown>, never>>;
    },
});
