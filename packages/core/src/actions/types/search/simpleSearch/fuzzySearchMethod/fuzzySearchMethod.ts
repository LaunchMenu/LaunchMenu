import {createStandardMenuItem} from "../../../../../menus/items/createStandardMenuItem";
import {ISimpleSearchMethod} from "../_types/ISimpleSearchMethod";

/**
 * The fuzzy search method
 */
export const fuzzySearchMethod: ISimpleSearchMethod = {
    name: "Fuzzy",
    ID: "CoreFuzzySearchMethod",
    view: createStandardMenuItem({name: "Fuzzy finder"}),
    grade: (d, {search}) => (search.length > 0 ? 12 : 0),
    highlight: (text, query) => [{start: 2, end: 5}],
};
