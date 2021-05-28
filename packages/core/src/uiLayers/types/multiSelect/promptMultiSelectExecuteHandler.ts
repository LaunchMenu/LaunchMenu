import {createAction, createStandardBinding} from "../../../actions/createAction";
import {editExecuteHandler} from "../../../actions/types/execute/types/editExecuteHandler";
import {IAction} from "../../../actions/_types/IAction";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {IBindingCreatorConfig} from "../../../actions/_types/IBindingCreator";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {MultiSelectLayer} from "./MultiSelectLayer";
import {IMultiSelectExecuteData} from "./_types/IMultiSelectExecuteData";

/**
 * A handler to let users alter a field with multiple values given a selection of options
 */
export const promptMultiSelectExecuteHandler = createAction({
    name: "multi select handler",
    parents: [editExecuteHandler],
    core: (data: IMultiSelectExecuteData<unknown>[]) => ({
        children: data.map(({field, undoable, ...config}) =>
            editExecuteHandler.createBinding(
                ({context}) =>
                    new Promise<ICommand | void>(res => {
                        let cmd: ICommand | undefined;
                        context.open(
                            new MultiSelectLayer(field, {
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
            config:
                | IMultiSelectExecuteData<T>
                | IBindingCreatorConfig<IMultiSelectExecuteData<T>>
        ): IActionBinding<IAction<IMultiSelectExecuteData<unknown>, never>>;
    },
});
