import {createAction} from "../../createAction";

/**
 * Retrieves the connection group that can be used to visually connect items
 */
export const getConnectionGroupAction = createAction({
    name: "get connection group",
    core: (groups: Symbol[]) => ({result: new Set(groups)}),
});

/** The connection group for standard items */
export const standardConnectionGroup = Symbol("Standard connection");
