import {IJSON} from "../../_types/IJSON";
import {ISettingsFolderMenuItem} from "./ISettingsFolderMenuItem";
import {ISettingsConfig} from "./ISettingsConfig";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";
import {IUUID} from "../../_types/IUUID";

/**
 * A config for settings data that contains an ID such that it's indentifiable at runtime
 */
export type IIdentifiedSettingsConfig<
    V extends IJSON,
    F extends ISettingsFolderMenuItem<S>,
    S extends IJSONDeserializer = never
> = ISettingsConfig<V, F, S> & {
    /** An ID that only has to be consistent during 1 session */
    ID: IUUID;

    deserializers: S[];
    updater: (version: V, data: IJSON) => IJSON;
};
