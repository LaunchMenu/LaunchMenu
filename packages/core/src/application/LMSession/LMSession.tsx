import {DataCacher, Field, IDataHook, Loader} from "model-react";
import React from "react";
import {IOContext} from "../../context/IOContext";
import {IMenuSearchable} from "../../menus/actions/types/search/_types/IMenuSearchable";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {IQuery} from "../../menus/menu/_types/IQuery";
import {SettingsContext} from "../../settings/SettingsContext";
import {KeyEvent} from "../../keyHandler/KeyEvent";
import {TextField} from "../../textFields/TextField";
import {createHighlighterWithSearchPattern} from "../../uiLayers/types/menuSearch/createHighlighterWithSearchPattern";
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
import {IUUID} from "../../_types/IUUID";
import {withSession} from "../applets/declaration/withSession";
import {UILayer} from "../../uiLayers/standardUILayer/UILayer";
import {emitContextEvent} from "../../context/uiExtracters/emitContextEvent";
import {createMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {Breadcumbs} from "../../components/context/paths/Breadcrumbs";

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

    /** Additional applets for this session */
    public extraApplets = new Field([] as IApplet[]);
    /** Additional searchable sources for this session */
    public extraSearchables = new Field([] as IMenuSearchable[]);

    /** The search executer responsible for making the searches */
    public searchExecuter: SearchExecuter<IQuery, IPrioritizedMenuItem>;

    /** The applet that's currently selected */
    public selectedApplet = new Field(null as IApplet | null);

    /* Observers that track changes */
    public observers: {
        settingsContext?: Observer<SettingsContext>;
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
    }

    /**
     * Disposes of all data attached to this session
     */
    public destroy() {
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
        return emitContextEvent(this.context, event);
    }

    /**
     * Initializes the ioContext for this session
     */
    protected setupContext(): void {
        this.context = new IOContext({
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
            this.getApplets(hook).flatMap(applet =>
                applet.globalContextMenuItems instanceof Function
                    ? applet.globalContextMenuItems(hook)
                    : applet.globalContextMenuItems ?? []
            );
    }

    /**
     * Initializes the view for this session
     */
    protected setupView(): void {
        this.view = <ApplicationLayout key={this.id} context={this.context} />;
    }

    // Sets up the interface
    /**
     * Initializes all the UI
     */
    protected async setupUI(): Promise<void> {
        await this.setupMenu();
        await this.setupField();
        await this.setupContent();
    }

    /**
     * Initializes the menu to be displayed
     */
    protected async setupMenu(): Promise<void> {
        this.menu = new LMSessionMenu(this.context);

        await this.context.open(
            new UILayer({
                menu: this.menu,
                searchable: false,
                menuHandler: createMenuKeyHandler(this.menu, {
                    onExit: () => {
                        console.log("detect");
                    },
                }),
            })
        );

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
                    children: this.getSearchables(hook),
                }),
            },
            onAdd: item => this.menu.addItem(item),
            onRemove: item => this.menu.removeItem(item),
        });
    }

    /**
     * Initializes the field to be displayed
     */
    protected async setupField(): Promise<void> {
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

        await this.context.open(
            new UILayer({
                field: this.searchField,
                highlighter,
                icon: "search",
            })
        );
    }

    /**
     * Initializes the content to be displayed
     */
    protected async setupContent(): Promise<void> {
        // await this.context.open(new UILayer({contentView: {close: true}}));

        const setPath = (d: string[]) =>
            path.set(
                d.reduce(
                    (cur, name) => (cur.length == 0 ? [name] : [...cur, "/", name]),
                    []
                )
            );
        const path = new Field(["shit", "orange", "bread"]);
        await this.context.open(
            new UILayer({
                contentView: (
                    <Loader>
                        {h => (
                            <div>
                                <div>
                                    <button
                                        onClick={() =>
                                            setPath(["shit", "orange", "bread"])
                                        }>
                                        opt1
                                    </button>
                                    <button onClick={() => setPath(["shit", "bread"])}>
                                        opt2
                                    </button>
                                    <button
                                        onClick={() =>
                                            setPath(["shit", "orange", "bread", "shit"])
                                        }>
                                        opt3
                                    </button>
                                    <button
                                        onClick={() =>
                                            setPath(["shit", "potatoes", "bread"])
                                        }>
                                        opt4
                                    </button>
                                    <button onClick={() => setPath(["shit", "potatoes"])}>
                                        opt5
                                    </button>
                                    <button
                                        onClick={() =>
                                            setPath(["fuck", "potatoes", "bread"])
                                        }>
                                        opt6
                                    </button>
                                </div>
                                <Breadcumbs path={path.get(h)} />
                            </div>
                        )}
                    </Loader>
                ),
            })
        );
    }

    // Applet management
    /**
     * Retrieves the applets initialized with this session data
     * @param hook The hook to subscribe to changes
     * @returns The initialized applets
     */
    public getApplets(hook: IDataHook = null): IApplet[] {
        return [
            ...this.appletData.get(hook).map(({initializedApplet}) => initializedApplet),
            ...this.extraApplets.get(hook),
        ];
    }

    /**
     * Retrieves the searchables in this session
     * @param hook The hook to subscribe to changes
     * @returns The searchables
     */
    public getSearchables(hook: IDataHook = null): IMenuSearchable[] {
        return [
            ...this.appletData.get(hook).flatMap(({searchable}) => searchable ?? []),
            ...this.extraSearchables.get(hook),
        ];
    }

    /**
     * The applet data obtained from the applet manager
     */
    public appletData = new DataCacher<
        {applet: IApplet; initializedApplet: IApplet; searchable?: IMenuSearchable}[]
    >((h, currentAppletData = []) => {
        const managerApplets = this.LM.getAppletManager().getApplets(h);

        // Dispose the sessions related data for any applet that will no longer exist
        currentAppletData.map(appletData => {
            const stillExists = managerApplets.find(
                applet => applet == appletData.applet
            );
            if (!stillExists) appletData.initializedApplet.onCloseSession?.();
        });

        // Obtain the new applet data list
        return managerApplets.map(applet => {
            let updated = false;
            let searchableID = applet.ID;

            // Find the current data for this applet
            const current = currentAppletData.find(({applet: {ID}}) => ID == applet.ID);
            if (current) {
                // If the applet hasn't updated return the current data
                const hasUpdated = current.applet != applet;
                if (!hasUpdated) return current;

                // If it has updated, change the search id
                updated = true;
                if (current.searchable?.ID == searchableID)
                    searchableID = "updated-" + searchableID;
            }

            // Initialize the new applet
            const initializedApplet = withSession(applet, this);
            if (updated && DEV) this.callAppletReload(initializedApplet);

            // Obtain the searchable and return the data
            const searchable =
                initializedApplet.search &&
                this.getAppletSearchWithCategory(initializedApplet, searchableID);
            return {initializedApplet, applet, searchable};
        });
    });

    /**
     * Calls the reload of the given applet and sets up the disposers (Modifies the onCloseSession of the applet)
     * @param applet The applet to call reload on
     */
    protected callAppletReload(applet: IApplet) {
        const disposer = applet?.development?.onReload?.();
        if (disposer) {
            const oldOnClose = applet.onCloseSession;
            applet.onCloseSession = () => {
                disposer();
                oldOnClose?.();
            };
        }
    }

    /**
     * Wraps the search method of an applet to inject the applets category into the results
     * @param applet The applet to retrieve the searchable with results for
     * @param ID The ID of the searchable
     * @returns The menu searchable
     */
    protected getAppletSearchWithCategory(
        applet: IApplet,
        ID: IUUID = applet.ID
    ): IMenuSearchable {
        const category = this.LM.getAppletManager().getAppletCategory(applet);
        if (!category) return {...applet, ID} as IMenuSearchable;

        const categoryBinding = getCategoryAction.createBinding(category);
        return adjustSearchable({...applet, ID} as IMenuSearchable, {
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