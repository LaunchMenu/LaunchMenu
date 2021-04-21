import {Field} from "model-react";
import {IOContext} from "../../../../context/IOContext";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";
import {SetFieldCommand} from "../../../../undoRedo/commands/SetFieldCommand";
import {UndoRedoFacility} from "../../../../undoRedo/UndoRedoFacility";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {groupBy} from "../../../../utils/groupBy";
import {createAction, createStandardBinding} from "../../../createAction";
import {IAction} from "../../../_types/IAction";
import {IActionBinding} from "../../../_types/IActionBinding";
import {IBindingCreatorConfig} from "../../../_types/IBindingCreator";
import {executeAction} from "../executeAction";
import {IExecuteArg} from "../_types/IExecuteArg";
import {editExecuteHandler} from "./editExecuteHandler";
import {ISinglePromptExecuteData} from "./_types/ISinglePromptExecuteData";

/** An action to execute an input prompt only once, and assign it to all fields */
export const singlePromptExecuteHandler = createAction({
    name: "Set single input prompt ",
    parents: [editExecuteHandler],
    core: (data: ISinglePromptExecuteData<unknown>[]) => {
        const editBindings = data.map(
            ({
                fields,
                init,
                valueRetriever,
                equals,
                setValues,
                commandName = "Set values",
                undoable = true,
            }) =>
                editExecuteHandler.createBinding(async ({context}) => {
                    const currentVals = init ?? fields?.map(field => field.get()) ?? [];
                    if (currentVals.length == 0) return;

                    // Obtain the most frequent value amongst all the fields
                    const defaultValue = groupBy(currentVals, v => v, equals).reduce(
                        (best, {key, values}) =>
                            values.length > best.count
                                ? {count: values.length, value: key}
                                : best,
                        {count: 0, value: undefined}
                    ).value;

                    // Get the value
                    const resultField = new Field(defaultValue);
                    const retrieverResult = (await valueRetriever({
                        field: resultField,
                        context,
                    })) as IActionBinding;
                    let result: unknown = retrieverResult;

                    // Check if the result is an action binding and if so execute that binding to get the result
                    if (
                        retrieverResult &&
                        typeof retrieverResult == "object" &&
                        typeof retrieverResult.action == "object" &&
                        retrieverResult.action?.transform &&
                        retrieverResult.action?.get
                    ) {
                        // Create a new context, to make sure any potential dispatched command doesn't end up in the main history
                        const noUndoContext = new IOContext({
                            parent: context,
                            undoRedo: new UndoRedoFacility(),
                        });
                        await executeAction.execute(noUndoContext, [
                            {
                                actionBindings: [retrieverResult],
                            },
                        ]);
                        await noUndoContext.destroy();
                        result = resultField.get();
                    }

                    // Retrieve the field setter and setValues commands
                    let commands: ICommand[] = [];
                    if (setValues) commands = (await setValues(result)) || [];

                    const allCommands = fields
                        ? [
                              ...fields.map(field => new SetFieldCommand(field, result)),
                              ...commands,
                          ]
                        : commands;

                    // Either execute the commands directly, or return a compound command
                    if (!undoable) {
                        await Promise.all(allCommands.map(command => command.execute()));
                    } else if (allCommands.length > 0) {
                        return new CompoundCommand({name: commandName}, allCommands);
                    }
                })
        );

        return {
            children: editBindings,
            // As well as some result for programmatic access for extension
            result: {
                execute: ({context}: IExecuteArg) =>
                    executeAction.execute(context, [{actionBindings: editBindings}]),
                getSelectBindings: () => editBindings,
            },
        };
    },
    createBinding: createStandardBinding as {
        /**
         * Creates a new action binding
         * @param config The data for the binding, and optionally extra configuration
         * @returns The created binding
         */
        <T>(
            config:
                | ISinglePromptExecuteData<T>
                | IBindingCreatorConfig<ISinglePromptExecuteData<T>>
        ): IActionBinding<IAction<ISinglePromptExecuteData<unknown>, never>>;
    },
});
