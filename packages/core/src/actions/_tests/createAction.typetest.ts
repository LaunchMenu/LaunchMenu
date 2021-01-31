import {createAction} from "../createAction";

/** This function is never executed, but exists to test some TS declarations */
function neverExecuted() {
    const stringAction = createAction({
        name: "StringAction",
        core: (data: string[]) => ({result: data.join("-")}),
    });
    const stringActionHandler = createAction({
        name: "stringActionHandler",
        // The below core should error, because we didn't specify stringAction as a parent
        /** @ts-expect-error */
        core: (data: string[]) => ({
            result: data.join("*"),
            children: [stringAction.createBinding(data.join("*"))],
        }),
    });

    // The below should work without type errors since we properly specify the parents
    const stringActionHandler2 = createAction({
        name: "stringActionHandler",
        parents: [stringAction],
        core: (data: string[]) => ({
            result: data.join("*"),
            children: [stringAction.createBinding(data.join("*"))],
        }),
    });
}
