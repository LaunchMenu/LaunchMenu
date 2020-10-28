import {IJSON} from "../../_types/IJSON";
import {ISettingsFolderMenuItem} from "./ISettingsFolderMenuItem";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * A config for settings data
 */
export type ISettingsConfig<
    V extends IJSON,
    F extends ISettingsFolderMenuItem<S>,
    S extends IJSONDeserializer = never
> = {
    version: V;
    settings: () => F;
    deserializers?: S[];
    updater?: (version: V, data: IJSON) => IJSON;
};
