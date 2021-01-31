import {createAction} from "../../createAction";
import {executeAction} from "../../types/execute/executeAction";
import {openMenuExecuteHandler} from "../../types/execute/types/openMenuExecuteHandler";
import {sequentialExecuteHandler} from "../../types/execute/sequentialExecuteHandler";
import {simpleSearchHandler} from "../../types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {IActionBinding} from "../../_types/IActionBinding";
import {addBindingCreatorRequirement} from "../addBindingCreatorRequirement";

/** This function is never executed, but exists to test some TS declarations */
function neverExecuted() {
    const action = addBindingCreatorRequirement(
        createAction({
            name: "orange",
            core: (bindings: IActionBinding[]) => ({}),
        }),
        executeAction
    );

    const binding1 = simpleSearchHandler.createBinding({name: "test", itemID: 3});

    const binding2 = executeAction.createBinding(() => {});
    const binding3 = sequentialExecuteHandler.createBinding(() => {});
    const binding4 = openMenuExecuteHandler.createBinding({items: []});

    /** @ts-expect-error */
    action.createBinding(3);

    /** @ts-expect-error */
    action.createBinding(binding1);

    action.createBinding(binding2);

    action.createBinding(binding3);

    action.createBinding(binding4);

    /** @ts-expect-error */
    action.createBinding({data: binding1});

    /** @ts-expect-error */
    action.createBinding({subscribableData: () => binding1});

    action.createBinding({data: binding3});

    action.createBinding({subscribableData: () => binding3});

    /** @ts-expect-error */
    action.createBinding(25);

    const action2 = addBindingCreatorRequirement(
        createAction({
            name: "orange",
            core: (bindings: (IActionBinding | string)[]) => ({}),
        }),
        executeAction
    );

    /** @ts-expect-error */
    action2.createBinding(binding1);

    action2.createBinding(binding2);

    action2.createBinding("hoi");

    /** @ts-expect-error */
    action2.createBinding(5);
}
