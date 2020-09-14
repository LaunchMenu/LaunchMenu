import {IJSON} from "../../_types/IJSON";
import {ISettingsCategoryMenuItem} from "./ISettingsCategoryMenuItem";
import {ISettingsConfig} from "./ISettingsConfig";
import {IJSONDeserializer} from "./serialization/IJSONDeserializer";

/**
 * A config for settings data that contains an ID such that it's indentifiable at runtime
 */
export type IIdentifiedSettingsConfig<
    V extends IJSON,
    F extends ISettingsCategoryMenuItem<S>,
    S extends IJSONDeserializer = never
> = ISettingsConfig<V, F, S> & {
    /** An ID that only has be consistent during 1 session */
    ID: string;
};
