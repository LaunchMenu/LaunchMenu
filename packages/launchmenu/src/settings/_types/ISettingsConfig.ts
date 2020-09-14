import {IJSON} from "../../_types/IJSON";
import {ISettingsCategoryMenuItem} from "./ISettingsCategoryMenuItem";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * A config for settings data
 */
export type ISettingsConfig<
    V extends IJSON,
    F extends ISettingsCategoryMenuItem<S>,
    S extends IJSONDeserializer = never
> = {
    version: V;
    settings: () => F;
    deserializers?: S[];
    updater?: (version: V, data: IJSON) => IJSON;
};
