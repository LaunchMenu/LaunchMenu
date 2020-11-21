import {createStandardMenuItem} from "../../../../../menus/items/createStandardMenuItem";
import {ISimpleSearchMethod} from "../_types/ISimpleSearchMethod";

/**
 * The fuzzy search method
 */
export const fuzzySearchMethod: ISimpleSearchMethod = {
    view: createStandardMenuItem({name: "fuzzy finder"}),
    ID: "CoreFuzzySearchMethod",
    grade: () => 12,
};
