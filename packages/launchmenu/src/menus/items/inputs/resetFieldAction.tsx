import {resetAction} from "../../actions/types/reset/resetAction";
import {IResetFieldActionData} from "./_types/IResetFieldActionData";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";

/**
 * A reset action to reset field values
 */
export const resetFieldAction = resetAction.createHandler(
    (data: IResetFieldActionData<any>[]) => ({
        reset: async ({context}) => {
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
        },
    })
);
