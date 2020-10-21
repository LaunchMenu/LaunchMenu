import {constGetter} from "../../../utils/constGetter";
import {createStandardCategory} from "../createStandardCategory";

/**
 * Retrieves a category to put the controls of a menu in (in case the rest of the items are values)
 * @returns the category
 */
export const getControlsCategory = constGetter(() =>
    createStandardCategory({name: "Controls"})
);
