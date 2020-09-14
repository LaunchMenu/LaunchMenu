import {ObjectInterpolation} from "@emotion/core";

/**
 * The css styling to apply to a particular scope of tags
 */
export type IHighlightStyle = {
    scope: (string | string[])[];
    settings: ObjectInterpolation<undefined>;
};
