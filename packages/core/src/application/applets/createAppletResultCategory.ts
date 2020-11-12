import {ICategory} from "../../actions/types/category/_types/ICategory";
import {createStandardCategory} from "../../menus/categories/createStandardCategory";
import {IApplet} from "./_types/IApplet";

/**
 * Creates a menu category for a given applet
 * @param applet The applet to create the results category for
 * @returns The created category
 */
export function createAppletResultCategory(applet: IApplet): ICategory {
    const {info} = applet;
    return createStandardCategory({
        name: info.name,
        // description: "A category for the query results obtained for applet " + info.name,
    });
}
