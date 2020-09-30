import {Field, IDataHook, Loader} from "model-react";
import React from "react";
import {IOContext} from "../../context/IOContext";
import {IMenuSearchable} from "../../menus/actions/types/search/_types/IMenuSearchable";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {IQuery} from "../../menus/menu/_types/IQuery";
import {SettingsContext} from "../../settings/SettingsContext";
import {KeyEvent} from "../../stacks/keyHandlerStack/KeyEvent";
import {KeyHandlerStack} from "../../stacks/keyHandlerStack/KeyHandlerStack";
import {ViewStack} from "../../stacks/viewStack/ViewStack";
import {Box} from "../../styling/box/Box";
import {createTextFieldKeyHandler} from "../../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {TextField} from "../../textFields/TextField";
import {createHighlighterWithSearchPattern} from "../../textFields/types/searchField/createHighlighterWithSearchPattern";
import {UndoRedoFacility} from "../../undoRedo/UndoRedoFacility";
import {Observer} from "../../utils/modelReact/Observer";
import {SearchExecuter} from "../../utils/searchExecuter/SearchExecuter";
import {ApplicationLayout} from "../components/ApplicationLayout";
import {LaunchMenu} from "../LaunchMenu";
import {v4 as uuid} from "uuid";
import {IApplet} from "../applets/_types/IApplet";
import {LMSessionMenu} from "./LMSessionMenu";
import {adjustSearchable} from "../../utils/searchExecuter/adjustSearchable";
import {adjustSubscribable} from "../../utils/subscribables/adjustSubscribable";
import {
    getCategoryAction,
    getMenuCategory,
} from "../../menus/actions/types/category/getCategoryAction";
import {IContextMenuItemGetter} from "../../menus/actions/contextAction/_types/IContextMenuItemGetter";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";

/**
 * An application session
 */
export class LMSession {
    /** The view that can be used to render this session */
    public view: JSX.Element;
    /** The IO context for this session */
    public context: IOContext;
    /** The unique runtime id of this session */
    public readonly id = uuid();

    /** The LaunchMenu runtime instance this session is part of */
    public LM: LaunchMenu;

    /** The main search field of this session */
    public searchField: TextField;
    /** The main results menu of this session */
    public menu: LMSessionMenu;

    /** The searchable sources */
    public searchables = new Field([] as IMenuSearchable[]);
    /** The search executer responsible for making the searches */
    public searchExecuter: SearchExecuter<IQuery, IPrioritizedMenuItem>;

    /** The applet that's currently selected */
    public selectedApplet = new Field(null as IApplet | null);

    /* Observers that track changes */
    public observers: {
        settingsContext?: Observer<SettingsContext>;
        applets?: Observer<IApplet[]>;
        search?: Observer<string>;
        menuCursor?: Observer<IMenuItem | null>;
    } = {};

    /**
     * Creates a new app session
     * @param lm The LM instance this is a session for
     */
    public constructor(lm: LaunchMenu) {
        this.LM = lm;

        this.setupContext();
        this.setupView();
        this.setupUI();
        this.setupApplets();
    }

    /**
     * Disposes of all data attached to this session
     */
    public destroy() {
        this.observers.applets?.destroy();
        this.observers.search?.destroy();
        this.observers.settingsContext?.destroy();
        this.observers.menuCursor?.destroy();
    }

    /**
     * Emits a key event to the session
     * @param event The event to dispatch
     * @returns Whether the event was caught
     */
    public emit(event: KeyEvent): Promise<boolean> {
        // TODO: remove this debug/testing code
        if (event.is(["ctrl", "n"])) {
            this.context.openUI({
                content: (
                    <Box padding="large">
                        LM is great m8 {this.context.panes.content.get().length}
                    </Box>
                ),
            });
        }
        return this.context.keyHandler.emit(event);
    }

    /**
     * Initializes the ioContext for this session
     */
    protected setupContext(): void {
        this.context = new IOContext({
            panes: {
                menu: new ViewStack(),
                content: new ViewStack(),
                field: new ViewStack(),
            },
            keyHandler: new KeyHandlerStack(),
            undoRedo: new UndoRedoFacility(),
            settings: new SettingsContext(),
            contextMenuItems: this.getGlobalContextMenuItems(),
        });

        // Retrieve the settings context from LM which includes all base settings data, and listen for changes
        this.observers.settingsContext = new Observer(h =>
            this.LM.getSettingsManager().getSettingsContext(h)
        ).listen(settingsContext => {
            this.context.settings = settingsContext;
        }, true);
    }

    /**
     * Retrieves the context menu items that should be global in this session
     * @returns The menu items
     */
    protected getGlobalContextMenuItems(): (hook: IDataHook) => IContextMenuItemGetter[] {
        return hook =>
            this.LM.getAppletManager()
                .getApplets(hook)
                .flatMap(applet =>
                    applet.globalContextMenuItems instanceof Function
                        ? applet.globalContextMenuItems(this, hook)
                        : applet.globalContextMenuItems ?? []
                );
    }

    /**
     * Initializes the view for this session
     */
    protected setupView(): void {
        this.view = (
            <ApplicationLayout
                key={this.id}
                fieldStack={this.context.panes.field}
                menuStack={this.context.panes.menu}
                contentStack={this.context.panes.content}
            />
        );
    }

    // Sets up the interface
    /**
     * Initializes all the UI
     */
    protected setupUI(): void {
        this.setupMenu();
        this.setupField();
        this.setupContent();
    }

    /**
     * Initializes the menu to be displayed
     */
    protected setupMenu(): void {
        this.menu = new LMSessionMenu(this.context);

        this.context.openUI({
            menu: this.menu,
            searchable: false,
        });

        // Update the selected applet based on what category a given item belongs to
        const appletManager = this.LM.getAppletManager();
        this.observers.menuCursor = new Observer(h => this.menu.getCursor(h)).listen(
            item => {
                if (item) {
                    const category = getMenuCategory(item);
                    const appletData = appletManager
                        .getAppletCategories()
                        .find(({category: cat}) => cat == category);
                    if (appletData) this.selectedApplet.set(appletData.applet);
                }
            },
            true
        );

        // Setup a search executer
        this.searchExecuter = new SearchExecuter({
            searchable: {
                ID: "root",
                search: async (query, hook) => ({
                    children: this.searchables.get(hook),
                }),
            },
            onAdd: item => this.menu.addItem(item),
            onRemove: item => this.menu.removeItem(item),
        });
    }

    /**
     * Initializes the field to be displayed
     */
    protected setupField(): void {
        // Create a text field and connect it to the search executer
        this.searchField = new TextField();

        this.observers.search = new Observer(h => this.searchField.get(h)).listen(
            search => {
                const query = {search};
                this.searchExecuter.setQuery(query);
                this.menu?.setQuery(query);
            }
        );
        const highlighter = createHighlighterWithSearchPattern(h =>
            this.searchExecuter.getPatternMatches(h)
        );

        this.context.openUI({
            field: this.searchField,
            highlighter,
            icon: "search",
            fieldHandler: createTextFieldKeyHandler(
                this.searchField,
                this.context,
                () => {
                    console.log("detect");
                }
            ),
        });
    }

    /**
     * Initializes the content to be displayed
     */
    protected setupContent(): void {
        this.context.openUI({
            content: (
                <Box padding="large">
                    <Loader>{h => this.selectedApplet.get(h)?.info.name}</Loader>
                    <br />
                    LM is great m8
                </Box>
            ),
        });
    }

    // Sets up the applets in this session
    /**
     * Initializes the applets within this context
     */
    protected setupApplets(): void {
        let first = true;
        const appletManager = this.LM.getAppletManager();
        this.observers.applets = new Observer(h => appletManager.getApplets(h)).listen(
            (applets, _, prevApplets) => {
                const newApplets = first
                    ? applets
                    : applets.filter(applet => !prevApplets.includes(applet));

                // Obtain the new searchables
                const oldSearchables = this.searchables.get(null);
                const idUpdatedSearchables = applets.flatMap(applet => {
                    if (applet.search) {
                        // Make sure the id changes if the applet changed, to make the search pick up on it
                        if (
                            newApplets.includes(applet) &&
                            oldSearchables.find(({ID: id}) => id == applet.ID)
                        ) {
                            return {
                                ...applet,
                                ID: "updated-" + applet.ID,
                            };
                        } else return applet;
                    } else return [];
                });
                const searchables = idUpdatedSearchables.map(applet =>
                    this.getAppletSearchWithCategory(applet)
                );
                this.searchables.set(searchables);

                // Initialize the new applets
                if (DEV)
                    newApplets.forEach(applet => {
                        const disposer = applet?.development?.onReload?.(this);
                        if (disposer)
                            this.LM.getAppletManager().addAppletDisposer(
                                applet.ID,
                                disposer
                            );
                    });

                first = false;
            },
            true
        );
    }

    /**
     * Wraps the search method of an applet to inject the applets category into the results
     * @param applet The applet to retrieve the searchable with results for
     * @returns The menu searchable
     */
    protected getAppletSearchWithCategory(applet: IApplet): IMenuSearchable {
        const category = this.LM.getAppletManager().getAppletCategory(applet);
        if (!category) return applet as IMenuSearchable;
        const categoryBinding = getCategoryAction.createBinding(category);
        return adjustSearchable(applet as IMenuSearchable, {
            item: result =>
                result
                    ? {
                          ...result,
                          item: {
                              ...result.item,
                              actionBindings: adjustSubscribable(
                                  result.item.actionBindings,
                                  bindings => [categoryBinding, ...bindings]
                              ),
                          },
                      }
                    : result,
        });
    }
}
