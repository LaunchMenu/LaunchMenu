import {FuzzyRater as CoreRater} from "fuzzy-rater";
import {baseSettings} from "../../../../../../application/settings/baseSettings/baseSettings";
import {Priority} from "../../../../../../menus/menu/priority/Priority";
import {IPriority} from "../../../../../../menus/menu/priority/_types/IPriority";
import {IQuery} from "../../../../../../menus/menu/_types/IQuery";
import {SettingsContext} from "../../../../../../settings/SettingsContext";
import {highlightTags} from "../../../../../../textFields/syntax/utils/highlightTags";
import {IHighlightNode} from "../../../../../../textFields/syntax/_types/IHighlightNode";
import {ISimpleSearchGradeFields} from "../_types/ISimpleSearchGradeFields";
import {IFuzzyRaterConfig} from "./_types/IFuzzyRaterConfig";

/** A symbol to store the fuzzy rater under in the query  */
export const fuzzyRaterSymbol = Symbol("FuzzyRater");

/**
 * A class to rate the match quality of some given data
 */
export class FuzzyRater {
    protected rater: CoreRater;
    protected allowPartialMatches: boolean;
    protected maxOrderCost: number;
    protected caseInsensitive: boolean;
    protected penalizeMisses: boolean;

    /**
     * Creates a new fuzzy rater instance for a given query
     * @param query The query for which to create a rater
     * @param settings The settings/config to use for this rate
     */
    public constructor(query: string, settings: SettingsContext | IFuzzyRaterConfig) {
        if (!("skipPenalty" in settings)) {
            const SS = settings.get(baseSettings).search.fuzzySearchSettings;
            settings = {
                skipPenalty: SS.advanced.skipPenalty.get(),
                missingPenalty: SS.advanced.missingPenalty.get(),
                distancePenalty: SS.advanced.distancePenalty.get(),
                typoPenalty: SS.advanced.typoPenalty.get(),
                maximumCost: SS.advanced.maximumCost.get(),
                fuzziness: SS.fuzziness.get(),
                allowPartialMatches: SS.allowPartialMatches.get(),
                caseSensitive: SS.caseSensitive.get(),
            };
        }

        let {
            skipPenalty,
            missingPenalty,
            typoPenalty,
            distancePenalty,
            fuzziness: fuzzinessType,
            caseSensitive,
            allowPartialMatches,
            maximumCost,
        } = settings;
        distancePenalty = Math.max(1e-4, distancePenalty);
        skipPenalty /= distancePenalty;
        typoPenalty /= distancePenalty;

        this.allowPartialMatches = allowPartialMatches;
        this.maxOrderCost = maximumCost;
        this.caseInsensitive = !caseSensitive;

        this.penalizeMisses = missingPenalty > 0;

        this.rater = new CoreRater(query, {
            fuzziness: fuzzinessTemplates[fuzzinessType],
            missingPenalty: Math.max(1, missingPenalty),
            skipPenalty,
            typoPenalty,
        });
    }

    /**
     * Retrieves the priority for a given collection os search data
     * @param data The data to be rated
     * @returns The priority for this data
     */
    public rate(data: ISimpleSearchGradeFields): IPriority {
        // TODO: grade based on where the search is found (title > description > keywords > content)
        const combined = `${data.name ?? ""} ${data.description ?? ""} ${
            data.content ?? ""
        } ${data.tags?.join(" ") ?? ""}`;

        const match = this.rater.getMatch(
            this.caseInsensitive ? combined.toLowerCase() : combined
        );
        if (!this.allowPartialMatches && match.missingCost > 0) return 0;
        if (match.orderCost > this.maxOrderCost) return 0;

        // These scores only make sense when comparing results obtained in the same way
        // Some better function than division and 1* may be used to allow for better comparison to other result types
        const mainScore = Priority.HIGH / (1 + match.orderCost);
        if (this.penalizeMisses) {
            const missingScore = Priority.HIGH / (1 + match.missingCost);
            return [Priority.MEDIUM, missingScore, mainScore, match.extraBonus];
        }
        return [Priority.MEDIUM, mainScore, match.extraBonus];
    }

    /**
     * Highlights the query in the given piece of text
     * @param text The text to be highlighted
     * @returns The obtained highlight nodes
     */
    public highlight(text: string): IHighlightNode[] {
        const matchData = this.rater.getMatchData(
            this.caseInsensitive ? text.toLowerCase() : text
        );

        return matchData.matchGroups.map(matchGroup => ({
            ...matchGroup.range,
            ...(this.caseInsensitive && {
                text: text.substring(matchGroup.range.start, matchGroup.range.end),
            }),
            tags: [
                ...matchGroup.relations.map(relation =>
                    relation.type == "match"
                        ? highlightTags.searchHighlight
                        : highlightTags.error
                ),
                ...(matchGroup.range.text == "" ? [highlightTags.empty] : []),
            ],
        }));
    }

    /**
     * Get the rater for a given query
     * @param query The query to get the rater for
     * @returns the fuzzy rater for this query
     */
    public static getRater(
        query: IQuery & {[fuzzyRaterSymbol]?: FuzzyRater}
    ): FuzzyRater {
        let rater = query[fuzzyRaterSymbol];
        if (!rater)
            rater = query[fuzzyRaterSymbol] = new FuzzyRater(
                query.search,
                query.context.settings
            );
        return rater;
    }
}

/**
 * Some default templates for fuzziness types
 */
const fuzzinessTemplates = {
    none: {},
    minimal: {4: 1},
    medium: {4: 1, 7: 2},
    strong: {3: 1, 6: 2, 9: 3},
    "super strong": {3: 1, 4: 2, 7: 3},
};
