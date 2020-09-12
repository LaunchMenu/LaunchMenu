import React from "react";
import {TextField} from "../TextField";
import {ITextSelection} from "../_types/ITextSelection";
import {SearchMenu} from "../../menus/menu/SearchMenu";
import {IPrioritizedMenuCategoryConfig} from "../../menus/menu/_types/IAsyncMenuCategoryConfig";
import {openUI} from "../../context/openUI/openUI";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {Observer} from "../../utils/modelReact/Observer";
import {IIOContext} from "../../context/_types/IIOContext";
import {TextFieldView} from "../../components/fields/TextFieldView";
import {plaintextLexer} from "../syntax/plaintextLexer";
import {IHighlighter} from "../syntax/_types/IHighlighter";
import {addHighlightNodeTags} from "../syntax/utils/addHighlightNodeTags";
import {highlightTags} from "../syntax/utils/highlightTags";

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
                this.closeMenu();
                this.closeMenu = null;
            }
        } else {
            if (!this.closeMenu) {
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
    }

    /**
     * Destroys the search field, making sure that all listeners are removed
     */
    public destroy() {
        this.closeMenu?.();
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
        return {
            highlight: (syntax, h) => {
                const patternMatches = this.menu.getPatternMatches(h);

                let highlighter = defaultHighlighter;
                if (
                    usePatternHighlighter &&
                    patternMatches.length == 1 &&
                    patternMatches[0].highlighter
                )
                    highlighter = patternMatches[0].highlighter;
                const {nodes, errors} = highlighter.highlight(syntax);

                // Augment the node tags with the specified new tags
                let newNodes = nodes;
                patternMatches.forEach(pattern => {
                    if (pattern.highlight)
                        pattern.highlight.forEach(node => {
                            newNodes = addHighlightNodeTags(
                                newNodes,
                                node.start,
                                node.end,
                                "tags" in node ? node.tags : [highlightTags.patternMatch]
                            );
                        });
                });

                // Return the newly created nodes and the errors
                return {
                    nodes: newNodes,
                    errors,
                };
            },
        };
    }
}
