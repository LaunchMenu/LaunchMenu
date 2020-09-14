import {ReactElement} from "react";

/**
 * Information to use for listing applets
 */
export type IAppletInfo = {
    name: string;
    description: string;
    version: string;
    icon: string | ReactElement;
};
