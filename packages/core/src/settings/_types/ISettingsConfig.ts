import {IJSON} from "../../_types/IJSON";
import {ISettingsFolderMenuItem} from "./ISettingsFolderMenuItem";

/**
 * A config for settings data
 */
export type ISettingsConfig<
    V extends IJSON,
    F extends ISettingsFolderMenuItem,
> = {
    version: V;
    settings: () => F;
    updater?: (version: V, data: IJSON) => IJSON;
};
