import {SettingsFile} from "../../../settings/storage/fileTypes/SettingsFile";
import {ISettingsFolderMenuItem} from "../../../settings/_types/ISettingsFolderMenuItem";
import {IJSONDeserializer} from "../../../settings/_types/serialization/IJSONDeserializer";
import {IJSON} from "../../../_types/IJSON";
import {IUUID} from "../../../_types/IUUID";
import {IApplet} from "../../applets/_types/IApplet";

/** Data related to the settings */
export type ISettingsData<
    T extends IJSONDeserializer = never,
    F extends ISettingsFolderMenuItem<T> = ISettingsFolderMenuItem<T>,
    V extends IJSON = IJSON
> = {
    /** The identifier of the settings */
    ID: IUUID;
    /** The file settings */
    file: SettingsFile<T, F, V>;
    /** The applet that these settings are for */
    applet?: IApplet;
};
