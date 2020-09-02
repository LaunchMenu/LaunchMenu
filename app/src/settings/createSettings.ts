import {IJSON} from "../_types/IJSON";
import {IIdentiedSettingsConfig} from "./_types/IIdentifiedSettingsConfig";
import {ISettingsConfig} from "./_types/ISettingsConfig";
import {IJSONDeserializer} from "./_types/serialization/IJSONDeserializer";
import {v4 as uuid} from "uuid";
import {ISettingsCategoryMenuItem} from "./_types/ISettingsCategoryMenuItem";

/**
 * Type checks the specified settings and adds an identifier
 * @param Config The settings config
 * @returns The config with an identifier
 */
export function createSettings<
    V extends IJSON,
    F extends ISettingsCategoryMenuItem<S>,
    S extends IJSONDeserializer = never
>(config: ISettingsConfig<V, F, S>): IIdentiedSettingsConfig<V, F, S> {
    return {...config, ID: uuid()};
}
