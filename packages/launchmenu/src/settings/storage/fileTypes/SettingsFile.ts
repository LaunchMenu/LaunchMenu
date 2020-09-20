import {IJSON} from "../../../_types/IJSON";
import {extractSettings} from "../../utils/extractSettings";
import {ISettingsFolderMenuItem} from "../../_types/ISettingsFolderMenuItem";
import {IJSONDeserializer} from "../../_types/serialization/IJSONDeserializer";
import {TSettingsTree} from "../../_types/TSettingsTree";
import {VersionedFieldsFile} from "./VersionedFieldsFile/VersionFieldsFile";

/**
 * A file that stores the fields structure as well as the settings UI
 */
export class SettingsFile<
    T extends IJSONDeserializer = never,
    F extends ISettingsFolderMenuItem<T> = ISettingsFolderMenuItem<T>,
    V extends IJSON = IJSON
> extends VersionedFieldsFile<TSettingsTree<F["children"], T>, T, V> {
    public settings: F;

    /**
     * Creates a new settings file object, without custom field types
     * @param data The data to construct the settings file from
     */
    public constructor(data: {
        /** The version of the settings */
        version: V;
        /** A function that updates from previous versions of the data to the latest version */
        updater: (version: V, data: IJSON) => IJSON;
        /** The path of the file */
        path: string;
        /** The settings without any custom types */
        settings: (() => F) | F;
        /** No deserializers */
        deserializers?: undefined;
    });

    /**
     * Creates a new settings file object with custom field types
     * @param data The data to construct the settings file from
     */
    public constructor(data: {
        /** The version of the settings */
        version: V;
        /** A function that updates from previous versions of the data to the latest version */
        updater: (version: V, data: IJSON) => IJSON;
        /** The path of the file */
        path: string;
        /** The custom types for that can be used for deserialization */
        deserializers: T[];
        /** The settings with possible custom types */
        settings: (() => F) | F;
    });
    public constructor(data: {
        version: any;
        updater: (version: V, data: IJSON) => IJSON;
        path: string;
        deserializers?: T[];
        settings: (() => F) | F;
    }) {
        let settings =
            data.settings instanceof Function ? data.settings() : data.settings;
        super({
            ...data,
            fields: extractSettings(settings),
        } as any);
        this.settings = settings;
    }
}
