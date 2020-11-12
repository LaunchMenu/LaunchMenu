import {IResetFieldActionData} from "./_types/IResetFieldActionData";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {createAction} from "../../../actions/createAction";
import {IExecutableFunction} from "../../../actions/types/execute/_types/IExecutable";
import {resetAction} from "../../../actions/types/reset/resetAction";

/**
 * A reset action to reset field values
 */
export const resetFieldAction = createAction({
    name: "reset field",
    parents: [resetAction],
    core: (data: IResetFieldActionData<any>[]) => {
        const reset: IExecutableFunction = async ({context}) => {
            const cmds = data.flatMap(({field, default: def, undoable}) => {
                if (undoable) return new SetFieldCommand(field, def);
                else {
                    field.set(def);
                    return [];
                }
            });

            if (cmds.length > 0)
                context.undoRedo.execute(
                    new CompoundCommand({name: "Reset fields"}, cmds)
                );
        };

        return {
            children: [resetAction.createBinding(reset)],
            result: {reset},
        };
    },
});
