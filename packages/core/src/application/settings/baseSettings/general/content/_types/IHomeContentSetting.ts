import {IDataHook} from "model-react";
import {ReactElement} from "react";
import {IUUID} from "../../../../../../_types/IUUID";
import {IHomeContentOption} from "./IHomeContentOptions";

/**
 * The type of the home content setting
 */
export type IHomeContentSetting = {
    // Current value management
    /**
     * Sets the content element to show
     * @param value The option data (only works if the option is available)
     */
    set: (value: IHomeContentOption) => void;

    /**
     * Retrieves the current home content
     * @param hook The data hook to subscribe to changes
     * @returns The home content element
     */
    get: (hook?: IDataHook) => IHomeContentOption;

    /**
     * Sets the ID of the content to show
     * @param ID The ID of the element to show
     */
    setSerialized: (ID: IUUID) => void;

    /**
     * Retrieves the current ID of the content to show
     * @param hook The data hook to subscribe to changes
     * @returns The ID of the shown content
     */
    getSerialized: (hook?: IDataHook) => IUUID;

    // Option management
    /**
     * Adds an option to the setting
     * @param option The option to be added
     */
    addOption: (option: IHomeContentOption) => void;

    /**
     * Removes an option from the setting
     * @param option The option to be removed
     */
    removeOption: (option: IUUID | IHomeContentOption) => void;

    /**
     * Retries all the possible content options
     * @param hook The data hook to subscribe to changes
     * @returns All the available content options
     */
    getOptions: (hook?: IDataHook) => IHomeContentOption[];
};
