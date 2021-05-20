import {createBooleanSetting} from "../../../../../../../settings/inputs/createBooleanSetting";
import {createNumberSetting} from "../../../../../../../settings/inputs/createNumberSetting";
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
            caseSensitive: createBooleanSetting({name: "Case sensitive", init: false}),
            allowPartialMatches: createBooleanSetting({
                name: "Allow partial matches",
                init: false,
            }),
            advanced: createSettingsFolder({
                name: "Advanced",
                children: {
                    typoPenalty: createNumberSetting({
                        name: "Typo penalty",
                        min: 0,
                        init: 20,
                    }),
                    skipPenalty: createNumberSetting({
                        name: "Skip penalty",
                        min: 0,
                        init: 40,
                    }),
                    missingPenalty: createNumberSetting({
                        name: "Missing penalty",
                        min: 0,
                        init: 100,
                    }),
                    distancePenalty: createNumberSetting({
                        name: "Distance penalty",
                        min: 0,
                        init: 1,
                    }),
                    maximumCost: createNumberSetting({
                        name: "Maximum cost",
                        min: 0,
                        init: 150,
                    }),
                },
            }),
        },
    });
}
