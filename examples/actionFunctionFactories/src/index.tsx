import {
    createAction,
    createSettings,
    createSettingsFolder,
    declare,
} from "@launchmenu/core";

type Func = {
    /** @returns Whether the function was successful */
    execute: () => boolean;
};

const doSomething = createAction({
    name: "doSomething",
    core: (funcs: Func[]) => ({
        result: {
            execute: () =>
                funcs.reduce((allPassed, func) => allPassed && func.execute(), true),
        },
    }),
});

const item1 = {
    actionBindings: [
        doSomething.createBinding({
            execute: () => {
                console.log("hoi");
                return true;
            },
        }),
    ],
};
const item2 = {
    actionBindings: [
        doSomething.createBinding({
            execute: () => {
                console.log("bye");
                return true;
            },
        }),
    ],
};
const executer = doSomething.get([item1, item2]);
console.log(executer.execute()); // == true  and logs "hoi" followed by "bye"

/************************************************************
 * This section isn't part of the example,                  *
 * just required for us to run this code as an LM applet    *
 * and get live reloading capabilities.                     *
 ************************************************************/
const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
});
