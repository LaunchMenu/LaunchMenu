import {IJSON} from "../_types/IJSON";
import {IIdentifiedSettingsConfig} from "./_types/IIdentifiedSettingsConfig";
import {ISettingsConfig} from "./_types/ISettingsConfig";
import {v4 as uuid} from "uuid";
import {ISettingsFolderMenuItem} from "./_types/ISettingsFolderMenuItem";

/**
 * Type checks the specified settings and adds an identifier
 * @param Config The settings config
 * @returns The config with an identifier
 */
export function createSettings<V extends IJSON, F extends ISettingsFolderMenuItem>(
    config: ISettingsConfig<V, F>
): IIdentifiedSettingsConfig<V, F> {
    return {
        updater: (version, data) => data,
        ...config,
        ID: uuid(),
    };
}
