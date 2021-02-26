import {
    addBindingCreatorRequirement,
    createContextAction,
    IActionBinding,
    Priority,
} from "@launchmenu/core";
import {setNoteCategoryNameExecuteHandler} from "./setNoteCategoryNameExecuteHandler";

/**
 * A dedicated context menu set name action
 */
export const setNoteCategoryNameAction = addBindingCreatorRequirement(
    createContextAction({
        name: "Set category name",
        contextItem: {
            name: "Set name",
            icon: "edit",
            priority: [Priority.HIGH, Priority.HIGH - 34],
        },
        core: (actionBindings: IActionBinding[]) => ({
            actionBindings,
        }),
    }),
    setNoteCategoryNameExecuteHandler
);
