import {IOContext} from "../../../context/IOContext";
import {IMenuSearchable} from "../../../menus/actions/types/search/_types/IMenuSearchable";
import {IIdentifiedSettingsConfig} from "../../../settings/_types/IIdentifiedSettingsConfig";
import {ISettingsFolderMenuItem} from "../../../settings/_types/ISettingsFolderMenuItem";
import {IJSON} from "../../../_types/IJSON";
import {IUUID} from "../../../_types/IUUID";
import {IAppletInfo} from "./IAppletInfo";
import {LaunchMenu} from "../../LaunchMenu";
import {LMSession} from "../../LMSession/LMSession";
import {IPrioritizedMenuItem} from "../../../menus/menu/_types/IPrioritizedMenuItem";
import {IDataHook} from "model-react";

/**
 * An applet plugin for LM
 */
export type IApplet<
    S extends IIdentifiedSettingsConfig<
        IJSON,
        ISettingsFolderMenuItem,
        any
    > = IIdentifiedSettingsConfig<IJSON, ISettingsFolderMenuItem, any>
> = {
    /** A unique ID for this module */
    ID: IUUID;
    /** The applet info for listings */
    info: IAppletInfo;
    /** Settings of the applet */
    settings: S;
    /** Menu items that should appear in all context menus */
    globalContextMenuItems?:
        | IPrioritizedMenuItem[]
        | ((session: LMSession, hook: IDataHook) => IPrioritizedMenuItem[]);
    /** Opens the application */
    open?: (context: IOContext, onClose: () => void) => void;
    /** A search method to find item matches within this applet  */
    search?: IMenuSearchable["search"];

    /** Called whenever the applet is first loaded, return value is called when applet is disposed */
    onInit?: (LM: LaunchMenu) => (() => void) | void;

    /** Development time specific information/tools */
    development?: {
        /** Whether to listen for changes in code and auto reload the applet when detected */
        liveReload?: boolean;
        /** The directory to watch for changes (defaults to 'build') */
        watchDirectory?: string;
        /** A callback for when the module is reloaded during development, can be used to programmatically navigate to a specific section of your app.
         * Return function is called when applet is disposed
         */
        onReload?: (session: LMSession) => (() => void) | void;
    };
};
