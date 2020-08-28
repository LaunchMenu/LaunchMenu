import {TextField} from "../TextField";
import {ITextSelection} from "../_types/ITextSelection";
import {SearchMenu} from "../../menus/menu/SearchMenu";
import {IPrioritizedMenuCategoryConfig} from "../../menus/menu/_types/IAsyncMenuCategoryConfig";
import {IQuery} from "../../menus/menu/_types/IQuery";
import {openUI} from "../../context/openUI/openUI";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {Observer} from "../../utils/modelReact/Observer";
import {IIOContext} from "../../context/_types/IIOContext";

/**
 * A search field that manages the search menu
 */
export class SearchField extends TextField {
    protected targetMenu: IMenu;
    protected context: IIOContext;

    protected targetObserver: Observer<IMenuItem[]>;

    public readonly menu: SearchMenu;
    protected closeMenu: (() => void) | null;

    /**
     * Creates a new SearchField which can be used to search within a menu
     * @param data The menu, context and config data
     */
    public constructor(data: {
        /** The menu this field should search in */
        menu: IMenu;
        /** The context to open the search menu in */
        context: IIOContext;
        /** Category configuration for the search results */
        categoryConfig?: IPrioritizedMenuCategoryConfig<IQuery>;
        /** Initial search text */
        text?: string;
        /** Initial text selection */
        selection?: ITextSelection;
    }) {
        super(data.text, data.selection);
        this.context = data.context;

        this.targetMenu = data.menu;
        this.menu = new SearchMenu(this.context, data.categoryConfig);

        this.targetObserver = new Observer(h => this.targetMenu.getItems(h)).listen(
            items => this.menu.setSearchItems(items),
            true
        );
    }

    /**
     * Sets the search value
     * @param search The search value
     */
    public set(search: string): void {
        if (this.get() == search) return;
        super.set(search);
        this.menu.setSearch(search);

        // Open or close the menu
        if (search.length == 0) {
            if (this.closeMenu) {
                this.closeMenu();
                this.closeMenu = null;
            }
        } else {
            if (!this.closeMenu)
                this.closeMenu = openUI(
                    this.context,
                    {
                        menu: this.menu,
                        searchable: false,
                        destroyOnClose: false,
                    },
                    () => this.set("")
                );
        }
    }

    /**
     * Destroys the search field, making sure that all listeners are removed
     */
    public destroy() {
        this.closeMenu?.();
        this.menu.destroy();
        this.targetObserver.destroy();
    }
}
