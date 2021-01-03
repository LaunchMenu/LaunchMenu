import {createSimpleSearchHandlerMethodSetting} from "../../../../actions/types/search/tracedRecursiveSearch/simpleSearch/createSimpleSearchHandlerMethodSetting";
import {createFuzzySearchSettingsFolder} from "../../../../actions/types/search/tracedRecursiveSearch/simpleSearch/fuzzySearchMethod/settings/createFuzzySearchSettingsFolder";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";

/**
 * Creates a new search settings folder
 * @returns The created search settings folder
 */
export function createSearchSettingsFolder() {
    return createSettingsFolder({
        name: "Search",
        children: {
            simpleSearchMethod: createSimpleSearchHandlerMethodSetting(),
            fuzzySearchSettings: createFuzzySearchSettingsFolder(),
        },
    });
}
