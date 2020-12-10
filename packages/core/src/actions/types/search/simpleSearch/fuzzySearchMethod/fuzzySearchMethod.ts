import {createStandardMenuItem} from "../../../../../menus/items/createStandardMenuItem";
import {ISimpleSearchMethod} from "../_types/ISimpleSearchMethod";
import {FuzzyRater} from "./FuzzyRater";

/**
 * The fuzzy search method
 */
export const fuzzySearchMethod: ISimpleSearchMethod = {
    name: "Fuzzy",
    ID: "CoreFuzzySearchMethod",
    view: createStandardMenuItem({name: "Fuzzy finder"}),
    rate: (data, query) => FuzzyRater.getRater(query).rate(data),
    highlight: (text, query) => FuzzyRater.getRater(query).highlight(text),
};
