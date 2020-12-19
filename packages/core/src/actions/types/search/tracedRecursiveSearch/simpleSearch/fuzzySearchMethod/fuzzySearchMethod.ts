import {createStandardMenuItem} from "../../../../../../menus/items/createStandardMenuItem";
import {ISimpleSearchMethod} from "../_types/ISimpleSearchMethod";
import {FuzzyRater} from "./FuzzyRater";

/**
 * The fuzzy search method
 */
export const fuzzySearchMethod: ISimpleSearchMethod = {
    name: "Fuzzy",
    ID: "CoreFuzzySearchMethod",
    view: createStandardMenuItem({name: "Fuzzy finder"}),
    rate: (data, search, query) => FuzzyRater.getRater(query, search).rate(data),
    highlight: (text, search, query) =>
        FuzzyRater.getRater(query, search).highlight(text),
};
