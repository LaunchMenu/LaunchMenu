import React from "react";
import {Field, IDataHook} from "model-react";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {IOContext} from "../../../context/IOContext";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {plaintextLexer} from "../../../textFields/syntax/plaintextLexer";
import {TextField} from "../../../textFields/TextField";
import {createHighlighterWithSearchPattern} from "./createHighlighterWithSearchPattern";
import {Observer} from "../../../utils/modelReact/Observer";
import {AbstractUILayer} from "../../AbstractUILayer";
import {IUILayerFieldData} from "../../_types/IUILayerFieldData";
import {IUILayerMenuData} from "../../_types/IUILayerMenuData";
import {IMenuSearchConfig} from "./_types/IMenuSearchConfig";
import {v4 as uuid} from "uuid";
import {ITextField} from "../../../textFields/_types/ITextField";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {createTextFieldKeyHandler} from "../../../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {IIOContext} from "../../../context/_types/IIOContext";
import {createMenuKeyHandler} from "../../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {MenuView} from "../../../components/menu/MenuView";
import {IViewStackItem} from "../../_types/IViewStackItem";
import {InstantOpenTransition} from "../../../components/stacks/transitions/open/InstantOpenTransition";
import {InstantCloseTransition} from "../../../components/stacks/transitions/close/InstantCloseTransition";

export class MenuSearch extends AbstractUILayer {
    protected data: IMenuSearchConfig;

    protected isMenuOpen = new Field(false);
    protected menuData = new Field(null as null | IUILayerMenuData);
    protected fieldData = new Field(null as null | IUILayerFieldData);

    /**
     * Creates a new SearchField which can be used to search within a menu
     * @param data The menu, context and config data
     */
    public constructor(data: IMenuSearchConfig) {
        super();
        this.data = data;
    }

    /** @override */
    public getMenuData(hook: IDataHook = null): IUILayerMenuData[] {
        const menuData = this.menuData.get(hook);
        return menuData && this.isMenuOpen.get(hook) ? [menuData] : [];
    }

    /** @override */
    public getFieldData(hook: IDataHook = null): IUILayerFieldData[] {
        const fieldData = this.fieldData.get(hook);
        return fieldData ? [fieldData] : [];
    }

    /** @override */
    protected initialize(context: IOContext, close: () => void): () => void {
        if (this.menuData.get(null))
            throw Error("A MenuSearch can only be opened in 1 context");

        // Create the menu and field data models
        const menu = new SearchMenu(context, this.data.categoryConfig);
        const field = new TextField(this.data.text, this.data.selection);

        // Obtain all the data for the field and menus
        const fieldData: IUILayerFieldData = {
            ID: uuid(),
            field,
            fieldView: this.getFieldView(field, menu),
            fieldHandler: this.getFieldHandler(field, context),
        };
        const menuData: IUILayerMenuData = {
            ID: uuid(),
            menu,
            menuView: this.getMenuView(menu),
            menuHandler: this.getMenuHandler(menu, () => {
                field.set("");
            }),
        };

        // Make the menu and field visible
        this.fieldData.set(fieldData);
        this.menuData.set(menuData);

        // Subscribe to the input menu items
        const menuObserver = new Observer(h => this.data.menu.getItems(h)).listen(
            items => menu.setSearchItems(items),
            true
        );

        // Subscribe to the searchfield input
        const fieldObserver = new Observer(h => field.get(h)).listen(search => {
            if (search) menu.setSearch(search); // Don't update if the search is empty
            this.isMenuOpen.set(search.length > 0);
        });

        // Dispose of the data properly when the layer is closed
        return () => {
            menu.destroy();
            menuObserver.destroy();
            fieldObserver.destroy();
            this.menuData.set(null);
            this.fieldData.set(null);
        };
    }

    /**
     * Retrieves the field view given a field and menu
     * @param field The field to create a view for
     * @param menu The menu to use for match highlighting
     * @returns The created view
     */
    protected getFieldView(field: ITextField, menu: SearchMenu): IViewStackItem {
        return (
            <TextFieldView
                field={field}
                icon={"search"}
                highlighter={createHighlighterWithSearchPattern(
                    h => menu.getPatternMatches(h),
                    this.data.highlighter || plaintextLexer,
                    this.data.usePatternHighlighter ?? true
                )}
            />
        );
    }

    /**
     * Retrieves the key handler for a field
     * @param field The field to create the handler for
     * @param context The context to be used for the key settings
     * @returns The key listener
     */
    protected getFieldHandler(field: ITextField, context: IIOContext): IKeyEventListener {
        return createTextFieldKeyHandler(field, context);
    }

    /**
     * Retrieves the view for a given menu
     * @param menu The menu to create the view for
     * @returns The created view
     */
    protected getMenuView(menu: SearchMenu): IViewStackItem {
        return {
            transitions: {Open: InstantOpenTransition, Close: InstantCloseTransition},
            view: <MenuView menu={menu} onExecute={this.data.onExecute} />,
        };
    }

    /**
     * Retrieves the key handler for a menu
     * @param menu The menu to create the handler fo
     * @param onExit The callback to execute when trying to exit the menu
     * @returns The key listener
     */
    protected getMenuHandler(menu: SearchMenu, onExit: () => void): IKeyEventListener {
        return createMenuKeyHandler(menu, {
            onExecute: this.data.onExecute,
            useItemKeyHandlers: this.data.useItemKeyHandlers,
            useContextItemKeyHandlers: this.data.useContextItemKeyHandlers,
            onExit,
        });
    }
}
