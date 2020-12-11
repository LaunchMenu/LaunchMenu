import {createBooleanMenuItem} from "../../../../../../../menus/items/inputs/types/createBooleanMenuItem";
import {createNumberMenuItem} from "../../../../../../../menus/items/inputs/types/createNumberMenuItem";
import {createSettingsFolder} from "../../../../../../../settings/inputs/createSettingsFolder";
import {createFuzzinessSetting} from "./createFuzzinessSetting";

/**
 * Creates a new fuzzy search settings folder
 * @returns The created fuzzy search settings folder
 */
export function createFuzzySearchSettingsFolder() {
    return createSettingsFolder({
        name: "Fuzzy Search",
        children: {
            fuzziness: createFuzzinessSetting(),
            caseSensitive: createBooleanMenuItem({name: "Case sensitive", init: false}),
            allowPartialMatches: createBooleanMenuItem({
                name: "Allow partial matches",
                init: false,
            }),
            advanced: createSettingsFolder({
                name: "Advanced",
                children: {
                    typoPenalty: createNumberMenuItem({
                        name: "Typo penalty",
                        min: 0,
                        init: 20,
                    }),
                    skipPenalty: createNumberMenuItem({
                        name: "Skip penalty",
                        min: 0,
                        init: 40,
                    }),
                    missingPenalty: createNumberMenuItem({
                        name: "Missing penalty",
                        min: 0,
                        init: 100,
                    }),
                    distancePenalty: createNumberMenuItem({
                        name: "Distance penalty",
                        min: 0,
                        init: 1,
                    }),
                    maximumCost: createNumberMenuItem({
                        name: "Maximum cost",
                        min: 0,
                        init: 150,
                    }),
                },
            }),
        },
    });
}
