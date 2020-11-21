import {SettingsFile} from "../../../settings/storage/fileTypes/SettingsFile";
import {ISettingsFolderMenuItem} from "../../../settings/_types/ISettingsFolderMenuItem";
import {IJSON} from "../../../_types/IJSON";
import {IUUID} from "../../../_types/IUUID";
import {IApplet} from "../../applets/_types/IApplet";

/** Data related to the settings */
export type ISettingsData<
    F extends ISettingsFolderMenuItem = ISettingsFolderMenuItem,
    V extends IJSON = IJSON
> = {
    /** The identifier of the settings */
    ID: IUUID;
    /** The file settings */
    file: SettingsFile<F, V>;
    /** The applet that these settings are for */
    applet?: IApplet;
    /** THe runtime version of the applet (used for applet reloading) */
    appletVersion?: IUUID;
};
