import {executeAction} from "../../types/execute/executeAction";
import {openMenuExecuteHandler} from "../../types/execute/types/openMenuExecuteHandler";
import {sequentialExecuteHandler} from "../../types/execute/sequentialExecuteHandler";
import {simpleSearchHandler} from "../../types/search/tracedRecursiveSearch/simpleSearch/simpleSearchHandler";
import {IActionBinding} from "../../_types/IActionBinding";
import {addBindingRequirement} from "../addBindingRequirement";

/** This function is never executed, but exists to test some TS declarations */
function neverExecuted() {
    const test = addBindingRequirement(binding => {
        return 8;
    }, executeAction);

    const binding1 = simpleSearchHandler.createBinding({name: "test", itemID: 3});

    const binding2 = executeAction.createBinding(() => {});
    const binding3 = sequentialExecuteHandler.createBinding(() => {});
    const binding4 = openMenuExecuteHandler.createBinding({items: []});

    /** @ts-expect-error */
    test(binding1);

    test(binding2);

    test(binding3);

    test(binding4);

    /** @ts-expect-error */
    test(25);

    const test2 = addBindingRequirement((binding: IActionBinding | string) => {
        return 8;
    }, executeAction);
    /** @ts-expect-error */
    test2(binding1);

    test2(binding2);

    test2("hoi");

    /** @ts-expect-error */
    test2(5);
}
