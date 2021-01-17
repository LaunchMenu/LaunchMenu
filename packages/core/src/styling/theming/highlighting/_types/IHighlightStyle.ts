import {CSSObject} from "@emotion/serialize";

/**
 * The css styling to apply to a particular scope of tags
 */
export type IHighlightStyle = {
    scope: (string | string[])[];
    settings: CSSObject;
};
