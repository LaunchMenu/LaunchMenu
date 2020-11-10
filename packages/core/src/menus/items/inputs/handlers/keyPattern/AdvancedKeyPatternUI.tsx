import React from "react";
import {Field, IDataHook} from "model-react";
import {MenuView} from "../../../../../components/menu/MenuView";
import {IIOContext} from "../../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../../../keyHandler/KeyPattern";
import {AbstractUILayer} from "../../../../../uiLayers/AbstractUILayer";
import {MenuSearch} from "../../../../../uiLayers/types/menuSearch/MenuSearch";
import {IUILayerContentData} from "../../../../../uiLayers/_types/IUILayerContentData";
import {IUILayerFieldData} from "../../../../../uiLayers/_types/IUILayerFieldData";
import {IUILayerMenuData} from "../../../../../uiLayers/_types/IUILayerMenuData";
import {IViewStackItem} from "../../../../../uiLayers/_types/IViewStackItem";
import {IField} from "../../../../../_types/IField";
import {IMenu} from "../../../../menu/_types/IMenu";
import {IAdvancedKeyPatternUIData} from "./_types/IAdvancedKeyPatternUIData";
import {IKeyEventListener} from "../../../../../keyHandler/_types/IKeyEventListener";
import {createMenuKeyHandler} from "../../../../menu/interaction/keyHandler/createMenuKeyHandler";
import {v4 as uuid} from "uuid";
import {IMenuItem} from "../../../_types/IMenuItem";
import {createKeyPatternOptionMenuItem} from "./keyPatternOptionMenuItem/createKeyPatternOptionMenuItem";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {updateKeyPatternOptionExecuteHandler} from "./keyPatternOptionMenuItem/actionHandlers/updateKeyPatternOptionExecuteHandler";
import {createFinishMenuItem} from "../../../createFinishMenuItem";
import {SetFieldCommand} from "../../../../../undoRedo/commands/SetFieldCommand";
import {ProxiedMenu} from "../../../../menu/ProxiedMenu";
import {AdvancedKeyPatternContent} from "./AdvancedKeyPatternContent";
import {getControlsCategory} from "../../../../categories/types/getControlsCategory";
import {getCategoryAction} from "../../../../../actions/types/category/getCategoryAction";

export class AdvancedKeyPatternUI extends AbstractUILayer {
    protected target: IField<KeyPattern>;
    protected config: IAdvancedKeyPatternUIData;

    protected value: IField<KeyPattern>;

    protected contentData = new Field(null as null | IUILayerContentData);
    protected menuData = new Field(null as null | IUILayerMenuData);
    protected menuSearch = new Field(null as null | MenuSearch);

    /**
     * Creates a new advanced key editor UI
     * @param field The field to be updated
     * @param config The configuration for the UI
     */
    public constructor(
        field: IField<KeyPattern>,
        config: IAdvancedKeyPatternUIData = {}
    ) {
        super("Key Editor");
        this.target = field;
        this.config = config;

        if (config.liveUpdate) this.value = field;
        else this.value = new Field(field.get(null));
    }

    /** @override */
    public getFieldData(hook: IDataHook = null): IUILayerFieldData[] {
        const menuSearch = this.menuSearch.get(hook);
        return menuSearch ? menuSearch.getFieldData(hook) : [];
    }

    /** @override */
    public getContentData(hook: IDataHook = null): IUILayerContentData[] {
        const contentData = this.contentData.get(hook);
        return [
            ...(contentData ? [contentData] : []),
            ...(this.menuSearch.get(hook)?.getContentData(hook) ?? []),
        ];
    }

    /** @override */
    public getMenuData(hook: IDataHook = null): IUILayerMenuData[] {
        const menuData = this.menuData.get(hook);
        return [
            ...(menuData ? [menuData] : []),
            ...(this.menuSearch.get(hook)?.getMenuData(hook) ?? []),
        ];
    }

    /** @override */
    protected async initialize(
        context: IIOContext,
        close: () => void
    ): Promise<() => void> {
        if (this.menuData.get(null))
            throw Error("An input can only be opened in 1 context");

        // Create the list of items for in the menu
        const controls = [this.getAddPatternItem(), this.getSubmitItem()];
        const getItems = (hook: IDataHook) => {
            const patterns = this.value.get(hook).patterns.map(option =>
                createKeyPatternOptionMenuItem({
                    patternField: this.value,
                    option,
                })
            );
            return [...controls, ...patterns];
        };

        // Create the data model
        const menu = new ProxiedMenu(context, getItems);

        // Obtain all menu data
        const menuData: IUILayerMenuData = {
            ID: uuid(),
            menu,
            menuView: this.getMenuView(menu),
            menuHandler: this.getMenuHandler(menu, close),
        };
        const menuSearch = new MenuSearch({menu});
        const contentData: IUILayerContentData = {
            ID: uuid(),
            contentView: <AdvancedKeyPatternContent pattern={h => this.value.get(h)} />,
        };

        const disposeSearch = await menuSearch.onOpen(context, () => {});

        // Open the UI
        this.contentData.set(contentData);
        this.menuData.set(menuData);
        this.menuSearch.set(menuSearch);

        // Return a disposer
        return () => {
            this.contentData.set(null);
            this.menuData.set(null);
            this.menuSearch.set(null);
            menu.destroy();
            disposeSearch();
        };
    }

    /**
     * Retrieves the menu view given the menu
     * @param menu The menu to create a view for
     * @returns The created view
     */
    protected getMenuView(menu: IMenu): IViewStackItem {
        return <MenuView menu={menu} />;
    }

    /**
     * Retrieves the key handler for a menu
     * @param menu The menu to create the handler for
     * @param close The function to close the UI
     * @returns The key listener
     */
    protected getMenuHandler(menu: IMenu, close: () => void): IKeyEventListener {
        return createMenuKeyHandler(menu, {onExit: close});
    }

    /**
     * Retrieves the item to be used to add a new pattern
     * @returns The item to be used to add a pattern
     */
    protected getAddPatternItem(): IMenuItem {
        return createStandardMenuItem({
            name: "Add pattern",
            actionBindings: [
                updateKeyPatternOptionExecuteHandler.createBinding({
                    patternField: this.value,
                    option: {type: "down", pattern: []},
                    insertIfDeleted: true,
                }),
                getCategoryAction.createBinding(getControlsCategory()),
            ],
        });
    }

    /**
     * Retrieves the item to be used to submit the changes
     * @returns The item to submit the changes
     */
    protected getSubmitItem(): IMenuItem {
        return createFinishMenuItem({
            onExecute: ({context}) => this.submit(context),
            actionBindings: [getCategoryAction.createBinding(getControlsCategory())],
        });
    }

    /**
     * Finish the editing and commits the changes
     * @param context The context to be used to execute the command with if configured to be undoable
     */
    public submit(context: IIOContext): void {
        // Set the new value
        const value = this.value.get(null);
        if (this.config.onSubmit) this.config.onSubmit(value);
        else if (this.config.undoable)
            context.undoRedo.execute(new SetFieldCommand(this.target, value));
        else this.target.set(value);

        // Close the UI
        this.closeAll();
    }
}
