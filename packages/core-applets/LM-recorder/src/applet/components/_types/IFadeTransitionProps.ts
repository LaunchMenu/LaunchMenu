import {IBoxProps} from "@launchmenu/core";

export type IFadeTransitionProps = {
    /** The dependencies, such that the fade is activated on dependency changes */
    deps: any[];
    /** Any props to use for the outer container */
    containerProps?: IBoxProps;
    /** Any props to use for the inner container */
    innerProps?: IBoxProps;
    /** The props to give to items that are fading out */
    fadeProps?: IBoxProps;
    /** The in and out fade duration */
    duration?: number;
    /** THe duration of the fade in */
    inDuration?: number;
    /** THe duration of the fade out */
    outDuration?: number;
};
