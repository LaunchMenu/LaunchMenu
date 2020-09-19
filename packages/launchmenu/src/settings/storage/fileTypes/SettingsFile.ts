import {IJSON} from "../../../_types/IJSON";
import {extractSettings} from "../../utils/extractSettings";
import {ISettingsCategoryMenuItem} from "../../_types/ISettingsCategoryMenuItem";
import {IJSONDeserializer} from "../../_types/serialization/IJSONDeserializer";
import {TSettingsTree} from "../../_types/TSettingsTree";
import {VersionedFieldsFile} from "./VersionedFieldsFile/VersionFieldsFile";
import {TFieldsTreeSerialized} from "./VersionedFieldsFile/_types/TFieldsTreeSerialized";

/**
 * A file that stores the fields structure as well as the settings UI
 */
export class SettingsFile<
    F extends ISettingsCategoryMenuItem<T>,
    T extends IJSONDeserializer = never,
    V extends IJSON = string
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
        updater: (
            version: V,
            data: IJSON
        ) => TFieldsTreeSerialized<TSettingsTree<F["children"], T>, T>;
        /** The path of the file */
        path: string;
        /** The settings without any custom types */
        settings: F;
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
        updater: (
            version: V,
            data: IJSON
        ) => TFieldsTreeSerialized<TSettingsTree<F["children"], T>, T>;
        /** The path of the file */
        path: string;
        /** The custom types for that can be used for deserialization */
        deserializers: T[];
        /** The settings with possible custom types */
        settings: F;
    });
    public constructor(data: {
        version: any;
        updater: (
            version: V,
            data: IJSON
        ) => TFieldsTreeSerialized<TSettingsTree<F["children"], T>, T>;
        path: string;
        deserializers?: T[];
        settings: F;
    }) {
        super({...data, fields: extractSettings(data.settings)} as any);
        this.settings = data.settings;
    }
}
