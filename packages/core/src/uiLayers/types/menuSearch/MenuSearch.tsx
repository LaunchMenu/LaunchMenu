import React, {ReactElement} from "react";
import {Field, IDataHook, Observer} from "model-react";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {IOContext} from "../../../context/IOContext";
import {SearchMenu} from "../../../menus/menu/SearchMenu";
import {plaintextLexer} from "../../../textFields/syntax/plaintextLexer";
import {TextField} from "../../../textFields/TextField";
import {createHighlighterWithSearchPattern} from "./createHighlighterWithSearchPattern";
import {AbstractUILayer} from "../../AbstractUILayer";
import {IUILayerFieldData} from "../../_types/IUILayerFieldData";
import {IUILayerMenuData} from "../../_types/IUILayerMenuData";
import {IMenuSearchConfig} from "./_types/IMenuSearchConfig";
import {v4 as uuid} from "uuid";
import {ITextField} from "../../../textFields/_types/ITextField";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {createStandardTextFieldKeyHandler} from "../../../textFields/interaction/keyHandler/createStandardTextFieldKeyHandler";
import {IIOContext} from "../../../context/_types/IIOContext";
import {createStandardMenuKeyHandler} from "../../../menus/menu/interaction/keyHandler/createStandardMenuKeyHandler";
import {MenuView} from "../../../components/menu/MenuView";
import {IViewStackItem} from "../../_types/IViewStackItem";
import {InstantOpenTransition} from "../../../components/context/stacks/transitions/open/InstantOpenTransition";
import {InstantCloseTransition} from "../../../components/context/stacks/transitions/close/InstantCloseTransition";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {IThemeIcon} from "../../../styling/theming/_types/IBaseTheme";
import {IDisposableKeyEventListener} from "../../../textFields/interaction/_types/IDisposableKeyEventListener";

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
        super({showNodataOverlay: false, catchAllKeys: false});
        this.data = data;
    }

    /** @override */
    public getMenuData(hook?: IDataHook): IUILayerMenuData[] {
        const menuData = this.menuData.get(hook);

        const hasSearch = this.isMenuOpen.get(hook);
        const sourceMenuLayer = this.data.defaultMenu && {
            ...getHooked(this.data.defaultMenu, hook),
            hideItemContent: hasSearch,
        };
        const standardLayers = sourceMenuLayer ? [sourceMenuLayer] : [];

        return super.getMenuData(
            hook,
            menuData && hasSearch ? [...standardLayers, menuData] : standardLayers
        );
    }

    /** @override */
    public getFieldData(hook?: IDataHook): IUILayerFieldData[] {
        const fieldData = this.fieldData.get(hook);
        return super.getFieldData(hook, fieldData ? [fieldData] : []);
    }

    /** @override */
    protected initialize(context: IOContext, close: () => void): () => void {
        if (this.menuData.get())
            throw Error("A MenuSearch can only be opened in 1 context");

        // Create the menu and field data models
        const menu = new SearchMenu(context, this.data.categoryConfig);
        const field = new TextField(this.data.text, this.data.selection);

        // Obtain all the data for the field and menus
        const fieldData: IUILayerFieldData = {
            ID: uuid(),
            field,
            fieldView: this.getFieldView(field, menu, this.data.icon),
            fieldHandler: this.getFieldHandler(field, context),
        };
        const {handler: menuHandler, destroy: destroyMenuHandler} = this.getMenuHandler(
            menu,
            () => {
                field.set("");
            }
        );
        const menuData: IUILayerMenuData = {
            ID: uuid(),
            menu,
            menuView: this.getMenuView(menu),
            menuHandler,
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
            destroyMenuHandler();
            this.menuData.set(null);
            this.fieldData.set(null);
        };
    }

    /**
     * Retrieves the field view given a field and menu
     * @param field The field to create a view for
     * @param menu The menu to use for match highlighting
     * @param icon The search icon
     * @returns The created view
     */
    protected getFieldView(
        field: ITextField,
        menu: SearchMenu,
        icon?: IThemeIcon | ReactElement
    ): IViewStackItem {
        return (
            <TextFieldView
                field={field}
                icon={icon || "search"}
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
        return createStandardTextFieldKeyHandler(field, context);
    }

    /**
     * Retrieves the view for a given menu
     * @param menu The menu to create the view for
     * @returns The created view
     */
    protected getMenuView(menu: SearchMenu): IViewStackItem {
        return {
            transitions: {
                Open: InstantOpenTransition,
                Close: InstantCloseTransition,
            },
            view: <MenuView menu={menu} onExecute={this.data.onExecute} />,
        };
    }

    /**
     * Retrieves the key handler for a menu
     * @param menu The menu to create the handler fo
     * @param onExit The callback to execute when trying to exit the menu
     * @returns The key listener
     */
    protected getMenuHandler(
        menu: SearchMenu,
        onExit: () => void
    ): IDisposableKeyEventListener {
        return createStandardMenuKeyHandler(menu, {
            onExecute: this.data.onExecute,
            useItemKeyHandlers: this.data.useItemKeyHandlers,
            useContextItemKeyHandlers: this.data.useContextItemKeyHandlers,
            onExit,
        });
    }

    /**
     * Retrieves whether the search menu is opened
     * @param hook The hook to subscribe to changes
     * @returns Whether the search menu is opened
     */
    public hasSearch(hook: IDataHook): boolean {
        return this.isMenuOpen.get(hook);
    }
}
