import {IResetFieldActionData} from "./_types/IResetFieldActionData";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {createAction} from "../../../actions/createAction";
import {resetAction} from "../../../actions/types/reset/resetAction";
import {IExecuteArg} from "../../../actions/types/execute/_types/IExecuteArg";

/**
 * A reset action to reset field values
 */
export const resetFieldAction = createAction({
    name: "reset field",
    parents: [resetAction],
    core: (data: IResetFieldActionData<any>[]) => {
        const reset = async ({context}: IExecuteArg) => {
            const cmds = data.flatMap(({field, default: def, undoable}) => {
                if (typeof def == "function") def = def();
                if (undoable) return new SetFieldCommand(field, def);
                else {
                    field.set(def);
                    return [];
                }
            });

            if (cmds.length > 0) return new CompoundCommand({name: "Reset fields"}, cmds);
        };

        return {
            children: [resetAction.createBinding(reset)],
            result: {reset},
        };
    },
});
