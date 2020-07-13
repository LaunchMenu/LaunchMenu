import {IAnyProps} from "./_types/IAnyProps";
import {IPropValueGetter} from "./_types/IPropValueGetter";
import {IPropDef} from "./_types/IPropDef";

/**
 * Helper function to retrieve attributes their css equivalent, with the value obtained from the theme
 * @param props The props to retrieve the data from
 * @param attributes The attribute data that maps to the css
 * @param theme The theme to get the data from
 * @returns The css props
 */
export function getAttributes(
    props: IAnyProps,
    attributes:
        | {
              [attribute: string]: IPropDef;
          }
        | ((attribute: string) => IPropDef),
    getValue: IPropValueGetter
): IAnyProps {
    const out = {};
    Object.keys(props).forEach(key => {
        const css = attributes instanceof Function ? attributes(key) : attributes[key];
        if (css) {
            // Obtain the value from the theme
            const value = getValue(props[key], key, out);

            // Assigns the value to the props
            if (typeof css == "string") {
                out[css] = value;
            } else if (typeof css == "function") {
                css(out, value, key, props[key], getValue);
            } else {
                out[key] = value;
            }
        }
    });
    return out;
}
