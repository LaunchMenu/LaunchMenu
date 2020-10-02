import {Field, IDataHook} from "model-react";
import {PrioritizedMenu} from "../../menus/menu/PrioritizedMenu";
import {IQuery} from "../../menus/menu/_types/IQuery";

/**
 * The main menu of a session
 */
export class LMSessionMenu extends PrioritizedMenu {
    protected query = new Field(null as IQuery | null);

    /**
     * Sets the search query
     * @param query The current query
     */
    public setQuery(query: IQuery | null): void {
        this.query.set(query);
    }

    /**
     * Retrieves the highlight data to use for highlighting within menu items
     * @param hook The hook to subscribe to changes
     * @returns The highlight data
     */
    public getQuery(hook: IDataHook = null): IQuery | null {
        return this.query.get(hook);
    }

    /**
     * Retrieves the highlight data to use for highlighting within menu items
     * @param hook The hook to subscribe to changes
     * @returns The highlight data
     */
    public getHighlight(hook: IDataHook = null): IQuery | null {
        return this.query.get(hook);
    }
}
