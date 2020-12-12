import {extractSettings} from "./utils/extractSettings";
import {IIdentifiedSettingsConfig} from "./_types/IIdentifiedSettingsConfig";
import {ISettingsFolderMenuItem} from "./_types/ISettingsFolderMenuItem";
import {TSettingsTree} from "./_types/TSettingsTree";

/**
 * A context to store the setting values for given configs in
 */
export class SettingsContext {
    protected settings = {} as {[ID: string]: ISettingsFolderMenuItem};

    /**
     * Creates a new empty settings context
     * @param settings The settings to begin with, mapped under their config ids
     */
    public constructor(settings?: {[ID: string]: ISettingsFolderMenuItem}) {
        this.settings = settings ?? {};
    }

    /**
     * Augments the current context with the given settings, resulting in a new context
     * @param config The config for the settings to augment
     * @param values The values to store for this config
     * @returns The newly created context
     */
    public augment<F extends ISettingsFolderMenuItem>(
        config: IIdentifiedSettingsConfig<any, F>,
        values: F
    ): SettingsContext {
        return new SettingsContext({...this.settings, [config.ID]: values});
    }

    /**
     * Retrieves a selection of settings from its config
     * @param config The settings group to retrieve
     * @returns The values for these settings within this context
     */
    public get<F extends ISettingsFolderMenuItem>(
        config: IIdentifiedSettingsConfig<any, F>
    ): TSettingsTree<F["children"]> {
        if (!config) throw Error("No config was provided");
        return extractSettings(this.getUI(config));
    }

    /**
     * Retrieves all of the UI for settings in this menu
     * @returns The UI to represent the settings
     */
    public getUI(): ISettingsFolderMenuItem[];

    /**
     * Retrieves a selection of settings and UI from its config
     * @param config The settings group to retrieve
     * @returns The UI to represent the settings
     */
    public getUI<F extends ISettingsFolderMenuItem>(
        config: IIdentifiedSettingsConfig<any, F>
    ): F;
    public getUI<F extends ISettingsFolderMenuItem>(
        config?: IIdentifiedSettingsConfig<any, F>
    ): F | ISettingsFolderMenuItem[] {
        if (config) {
            if (!this.settings[config.ID]) this.settings[config.ID] = config.settings();
            return this.settings[config.ID] as any;
        } else {
            return Object.values(this.settings);
        }
    }
}
