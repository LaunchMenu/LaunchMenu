import {createSimpleSearchHandlerMethodSettings} from "../../../actions/types/search/simpleSearch/createSimpleSearchHandlerMethodSetting";
import {createSettingsFolder} from "../../../settings/inputs/createSettingsFolder";

/**
 * Creates a new search settings folder
 * @returns The created search settings folder
 */
export function createSearchSettingsFolder() {
    return createSettingsFolder({
        name: "Search",
        children: {
            simpleSearchMethod: createSimpleSearchHandlerMethodSettings(),
        },
    });
}
