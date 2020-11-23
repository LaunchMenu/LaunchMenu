import {createStandardMenuItem} from "../../../../../menus/items/createStandardMenuItem";
import {Priority} from "../../../../../menus/menu/priority/Priority";
import {mergeHighlightNodes} from "../../../../../textFields/syntax/utils/mergeHighlightNodes";
import {ISimpleSearchMethod} from "../_types/ISimpleSearchMethod";
import {fuzzyRate} from "./fuzzyRate";

/**
 * The fuzzy search method
 */
export const fuzzySearchMethod: ISimpleSearchMethod = {
    name: "Fuzzy",
    ID: "CoreFuzzySearchMethod",
    view: createStandardMenuItem({name: "Fuzzy finder"}),
    rate: ({content = "", description = "", name = "", tags = []}, {search, context}) => {
        // TODO: discuss shit, and decide on how important each aspect is, remove temp stuff below
        const searchTerms = search.split(" ");
        const nameScore = searchTerms.reduce(
            (score, term) =>
                score + fuzzyRate(name, term).accuracy.reduce((a, b) => Math.max(a, b)),
            0
        );
        return (nameScore / searchTerms.length) * Priority.HIGH;
    },
    highlight: (text, {search}) =>
        search
            .split(" ")
            .map(queryWord => fuzzyRate(text, queryWord).getHighlightData())
            .reduce((nodes, wordNodes) => mergeHighlightNodes(nodes, wordNodes), []),
};
