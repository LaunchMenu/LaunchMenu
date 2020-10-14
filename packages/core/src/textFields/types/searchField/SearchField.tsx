import React from "react";
import {TextField} from "../../TextField";
import {ITextSelection} from "../../_types/ITextSelection";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {IPrioritizedMenuCategoryConfig} from "../../../menus/menu/_types/IAsyncMenuCategoryConfig";
import {IMenu} from "../../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {Observer} from "../../../utils/modelReact/Observer";
import {IIOContext} from "../../../context/_types/IIOContext";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {plaintextLexer} from "../../syntax/plaintextLexer";
import {IHighlighter} from "../../syntax/_types/IHighlighter";
import {createHighlighterWithSearchPattern} from "./createHighlighterWithSearchPattern";
import {UILayer} from "../../../uiLayers/standardUILayer/UILayer";

/**
 * A search field that manages the search menu
 */
export class SearchField extends TextField {
    protected targetMenu: IMenu;
    protected context: IIOContext;

    protected targetObserver: Observer<IMenuItem[]>;

    public readonly menu: SearchMenu;
    protected closeMenu: Promise<() => void> | null;

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
        categoryConfig?: IPrioritizedMenuCategoryConfig;
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

    /** The default view for a search bar */
    public view = (
        <TextFieldView
            field={this}
            icon={"search"}
            highlighter={this.getHighlighterWithPattern(plaintextLexer)}
        />
    );

    /**
     * Sets the search value
     * @param search The search value
     */
    public set(search: string): void {
        if (this.get() == search) return;
        super.set(search);
        if (search) this.menu.setSearch(search); // Don't update if the search is empty

        // Open or close the menu
        if (search.length == 0) {
            if (this.closeMenu) {
                this.closeMenu.then(close => close());
                this.closeMenu = null;
            }
        } else {
            if (!this.closeMenu) {
                this.closeMenu = this.context.open(
                    new UILayer(() => ({
                        menu: this.menu,
                        searchable: false,
                        onClose: () => this.set(""),
                    }))
                );
            }
        }
    }

    /**
     * Destroys the search field, making sure that all listeners are removed
     */
    public destroy() {
        this.closeMenu?.then(close => close());
        this.menu.destroy();
        this.targetObserver.destroy();
    }

    // Utils
    /**
     * Augments a given highlighter with the pattern match highlighting
     * @param defaultHighlighter The highlighter to extend, or the plain text highlighter if left out
     * @param usePatternHighlighter Whether to inherit the highlighter from a search pattern when available
     * @returns The augmented highlighter
     */
    public getHighlighterWithPattern(
        defaultHighlighter: IHighlighter = plaintextLexer,
        usePatternHighlighter: boolean = true
    ): IHighlighter {
        return createHighlighterWithSearchPattern(
            h => this.menu.getPatternMatches(h),
            defaultHighlighter,
            usePatternHighlighter
        );
    }
}
