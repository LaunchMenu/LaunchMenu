import {IDataHook} from "model-react";
import {IAction} from "../_types/IAction";
import {IActionTarget} from "../_types/IActionTarget";
import {createActionHandlerTree} from "./createActionHandlerTree";
import {createActionOrdering} from "./createActionOrering";
import {reduceActions} from "./reduceActions";

export const actionGetter =
    /**
     * Retrieves the result of this action applied to the given targets
     * @this
     * @param targets The targets to get the action result for
     * @param hook The data hook to subscribe to changes
     * @returns The action's result
     */
    function <I, O>(
        this: IAction<I, O, any>,
        targets: IActionTarget[],
        hook?: IDataHook
    ): O {
        const tree = createActionHandlerTree(this, targets, hook);
        const ordering = createActionOrdering(tree);
        const result = reduceActions(ordering, hook);
        return result?.result;
    };
