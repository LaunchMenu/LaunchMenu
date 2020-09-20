import {IJSON} from "../_types/IJSON";
import {IIdentifiedSettingsConfig} from "./_types/IIdentifiedSettingsConfig";
import {ISettingsConfig} from "./_types/ISettingsConfig";
import {IJSONDeserializer} from "./_types/serialization/IJSONDeserializer";
import {v4 as uuid} from "uuid";
import {ISettingsFolderMenuItem} from "./_types/ISettingsFolderMenuItem";
import {baseDeserializers, IBaseDeserializers} from "./baseDeserializers";

/**
 * Type checks the specified settings and adds an identifier
 * @param Config The settings config
 * @returns The config with an identifier
 */
export function createSettings<
    V extends IJSON,
    F extends ISettingsFolderMenuItem<S | IBaseDeserializers>,
    S extends IJSONDeserializer = never
>(
    config: ISettingsConfig<V, F, S>
): IIdentifiedSettingsConfig<V, F, S | IBaseDeserializers> {
    return {
        updater: (version, data) => data,
        ...config,
        deserializers: config.deserializers
            ? [...config.deserializers, ...baseDeserializers]
            : baseDeserializers,
        ID: uuid(),
    };
}
