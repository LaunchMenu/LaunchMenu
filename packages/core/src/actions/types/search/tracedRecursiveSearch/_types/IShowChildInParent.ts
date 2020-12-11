import {IIOContext} from "../../../../../context/_types/IIOContext";
import {IMenuItem} from "../../../../../menus/items/_types/IMenuItem";

export type IShowChildInParent = {
    /**
     * Opens UI to show the child item within its parent
     * @param data The data of what child to show
     * @returns A promise that resolves once the menu has been closed again
     */
    (data: {
        /** The parent to show the child in */
        parent?: IMenuItem;
        /** The child to be shown */
        child: IMenuItem;
        /** The context to open the UI in */
        context: IIOContext;
    }): Promise<void>;
};
