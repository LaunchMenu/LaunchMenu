import {IJSONDeserializer} from "../../settings/_types/serialization/IJSONDeserializer";
import {IJSON} from "../../_types/IJSON";
import {IApplet} from "./_types/IApplet";
import {IAppletConfig} from "./_types/IAppletConfig";
import {IAppletData} from "./_types/IAppletData";
import Path from "path";
import {IIdentifiedSettingsConfig} from "../../settings/_types/IIdentifiedSettingsConfig";
import {ISettingsCategoryMenuItem} from "../../settings/_types/ISettingsCategoryMenuItem";
import {SettingsFile} from "../../settings/storage/fileTypes/SettingsFile";

/**
 * A class to store the data that LM associates to an applet
 */
export class AppletData<
    F extends ISettingsCategoryMenuItem<T> = ISettingsCategoryMenuItem<never>,
    T extends IJSONDeserializer = never,
    V extends IJSON = IJSON
> implements IAppletData<V, T> {
    /** The applet information as defined in the applets config */
    public applet: IApplet<IIdentifiedSettingsConfig<V, any, T>>;
    /** The file that the applets' settings are saved in */
    public settingsFile: SettingsFile<F, T, V>;

    /**
     * Creates a new applet data instance
     * @param applet The applet to create all data for
     * @param appletID The unique ID of the applet
     * @param settingsDirectory The settings path
     */
    public constructor(
        applet:
            | IApplet<IIdentifiedSettingsConfig<V, any, T>>
            | IAppletConfig<IIdentifiedSettingsConfig<V, any, T>>,
        appletID: string,
        settingsDirectory: string
    ) {
        // Update the applet and setting ids
        if (!("ID" in applet)) {
            this.applet = {...applet, ID: appletID};
        } else {
            applet.ID = appletID;
            this.applet = applet;
        }
        this.applet.settings.ID = appletID;

        this.setupSettings(Path.join(settingsDirectory, appletID + ".json"));
    }

    /**
     * Initializes the settings file
     * @param path The path to store the
     */
    protected setupSettings(path: string): void {
        const settings = this.applet.settings;
        this.settingsFile = new SettingsFile<any, T, V>({
            version: settings.version,
            path,
            settings: settings.settings(),
            updater: settings.updater ?? ((v, d): any => d),
            deserializers: settings.deserializers ?? [],
        });
        this.settingsFile.load();
    }

    /**
     * Saves the settings of this applet
     */
    public async saveSettings(): Promise<void> {
        return this.settingsFile.save();
    }
}
