import {IMenuSearchable} from "../../../actions/types/search/_types/IMenuSearchable";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {IOContext} from "../../../context/IOContext";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";

/**
 * The config for execution related data of an applet
 */
export type IAppletExecutionConfig = {
    /** Menu items that should appear in all context menus */
    globalContextMenuBindings?: ISubscribable<IActionBinding[]>;
    /** Opens the application */
    open?: (args: {context: IOContext; onClose: () => void}) => void;
    /** A search method to find item matches within this applet  */
    search?: IMenuSearchable["search"];

    /** Development time specific information/tools */
    development?: {
        /** A callback for when the module is reloaded during development, can be used to programmatically navigate to a specific section of your app.
         * Return function is called when applet is disposed
         */
        onReload?: () => (() => void) | void;
    };
};
