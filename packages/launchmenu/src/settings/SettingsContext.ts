import {extractSettings} from "./utils/extractSettings";
import {IIdentifiedSettingsConfig} from "./_types/IIdentifiedSettingsConfig";
import {ISettingsCategoryMenuItem} from "./_types/ISettingsCategoryMenuItem";
import {IJSONDeserializer} from "./_types/serialization/IJSONDeserializer";
import {TSettingsTree} from "./_types/TSettingsTree";

/**
 * A context to store the setting values for given configs in
 */
export class SettingsContext {
    protected settings = {} as {[ID: string]: ISettingsCategoryMenuItem};

    /**
     * Creates a new empty settings context
     * @param settings The settings to begin with, mapped under their config ids
     */
    public constructor(settings?: {[ID: string]: ISettingsCategoryMenuItem}) {
        this.settings = settings ?? {};
    }

    /**
     * Augments the current context with the given settings, resulting in a new context
     * @param config The config for the settings to augment
     * @param values The values to store for this config
     * @returns The newly created context
     */
    public augment<F extends ISettingsCategoryMenuItem>(
        config: IIdentifiedSettingsConfig<any, F, IJSONDeserializer>,
        values: F
    ): SettingsContext {
        return new SettingsContext({...this.settings, [config.ID]: values});
    }

    /**
     * Retrieves a selection of settings from its config
     * @param config The settings group to retrieve
     * @returns The values for these settings within this context
     */
    public get<F extends ISettingsCategoryMenuItem, D extends IJSONDeserializer>(
        config: IIdentifiedSettingsConfig<any, F, D>
    ): TSettingsTree<F["children"], D> {
        return extractSettings(this.getUI(config));
    }

    /**
     * Retrieves all of the UI for settings in this menu
     * @returns The UI to represent the settings
     */
    public getUI(): ISettingsCategoryMenuItem[];

    /**
     * Retrieves a selection of settings and UI from its config
     * @param config The settings group to retrieve
     * @returns The UI to represent the settings
     */
    public getUI<F extends ISettingsCategoryMenuItem>(
        config: IIdentifiedSettingsConfig<any, F, IJSONDeserializer>
    ): F;
    public getUI<F extends ISettingsCategoryMenuItem>(
        config?: IIdentifiedSettingsConfig<any, F, IJSONDeserializer>
    ): F | ISettingsCategoryMenuItem[] {
        if (config) {
            if (!this.settings[config.ID]) this.settings[config.ID] = config.settings();
            return this.settings[config.ID] as any;
        } else {
            return Object.values(this.settings);
        }
    }
}
