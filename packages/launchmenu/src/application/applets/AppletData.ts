import {VersionedFieldsFile} from "../../settings/storage/fileTypes/VersionedFieldsFile/VersionFieldsFile";
import {IJSONDeserializer} from "../../settings/_types/serialization/IJSONDeserializer";
import {IJSON} from "../../_types/IJSON";
import {IApplet} from "./_types/IApplet";
import {IAppletConfig} from "./_types/IAppletConfig";
import {IAppletData} from "./_types/IAppletData";
import Path from "path";
import {IIdentifiedSettingsConfig} from "../../settings/_types/IIdentifiedSettingsConfig";

/**
 * A class to store the data that LM associates to an applet
 */
export class AppletData<V extends IJSON = IJSON, T extends IJSONDeserializer = never>
    implements IAppletData<V, T> {
    public applet: IApplet<IIdentifiedSettingsConfig<V, any, T>>;
    public settingsFile: VersionedFieldsFile<any, T, V>;

    /**
     * Creates a new applet data instance
     * @param applet The applet to create all data for
     * @param appletId The unique ID of the applet
     * @param settingsDirectory The settings path
     */
    public constructor(
        applet:
            | IApplet<IIdentifiedSettingsConfig<V, any, T>>
            | IAppletConfig<IIdentifiedSettingsConfig<V, any, T>>,
        appletId: string,
        settingsDirectory: string
    ) {
        this.applet = {...applet, id: appletId};
        this.setupSettings(Path.join(settingsDirectory, appletId));
    }

    /**
     * Initializes the settings file
     * @param path The path to store the
     */
    protected setupSettings(path: string): void {
        const settings = this.applet.settings;
        this.settingsFile = new VersionedFieldsFile<any, T, V>({
            version: settings.version,
            path,
            fields: settings.settings(),
            updater: settings.updater ?? ((v, d): any => d),
            deserializers: settings.deserializers ?? [],
        });
    }

    /**
     * Saves the settings of this applet
     */
    public async saveSettings(): Promise<void> {
        return this.settingsFile.save();
    }
}
