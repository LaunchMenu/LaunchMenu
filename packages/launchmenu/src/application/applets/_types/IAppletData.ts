import {VersionedFieldsFile} from "../../../settings/storage/fileTypes/VersionedFieldsFile/VersionFieldsFile";
import {ISettingsConfig} from "../../../settings/_types/ISettingsConfig";
import {IJSONDeserializer} from "../../../settings/_types/serialization/IJSONDeserializer";
import {IJSON} from "../../../_types/IJSON";
import {IApplet} from "./IApplet";
import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";

/**
 * The data that LM stores per applet
 */
export type IAppletData<V extends IJSON = IJSON, T extends IJSONDeserializer = never> = {
    /** The applet itself */
    applet: IApplet<IIdentifiedSettingsConfig<V, any, T>>;
    /** The settings data file */
    settingsFile: VersionedFieldsFile<any, T, V>;
};
