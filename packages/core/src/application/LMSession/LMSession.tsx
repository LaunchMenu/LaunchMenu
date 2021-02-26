import {
    DataCacher,
    Field,
    IDataHook,
    IDataRetriever,
    Loader,
    Observer,
} from "model-react";
import React from "react";
import {IOContext} from "../../context/IOContext";
import {IPrioritizedMenuItem} from "../../menus/menu/_types/IPrioritizedMenuItem";
import {IQuery} from "../../menus/menu/_types/IQuery";
import {SettingsContext} from "../../settings/SettingsContext";
import {KeyEvent} from "../../keyHandler/KeyEvent";
import {TextField} from "../../textFields/TextField";
import {createHighlighterWithSearchPattern} from "../../uiLayers/types/menuSearch/createHighlighterWithSearchPattern";
import {UndoRedoFacility} from "../../undoRedo/UndoRedoFacility";
import {ApplicationLayout} from "../components/ApplicationLayout";
import {LaunchMenu} from "../LaunchMenu";
import {v4 as uuid} from "uuid";
import {IApplet} from "../applets/_types/IApplet";
import {LMSessionMenu} from "./LMSessionMenu";
import {adjustSearchable} from "../../utils/searchExecuter/adjustSearchable";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {IUUID} from "../../_types/IUUID";
import {withSession} from "../applets/declaration/withSession";
import {UILayer} from "../../uiLayers/standardUILayer/UILayer";
import {emitContextEvent} from "../../context/uiExtracters/emitContextEvent";
import {createStandardMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createStandardMenuKeyHandler";
import {Breadcrumbs} from "../../components/context/paths/Breadcrumbs";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {IMenuSearchable} from "../../actions/types/search/_types/IMenuSearchable";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {adjustSubscribable} from "../../utils/subscribables/adjustSubscribable";
import {IStandardUILayerData} from "../../uiLayers/standardUILayer/_types/IStandardUILayerData";
import {Content} from "../../content/Content";
import {SearchExecuter} from "../../utils/searchExecuter/SearchExecuter";
import {standardOverlayGroup} from "../../uiLayers/UILayerMissingView";
import {MainMenuView} from "../components/MainMenuView";
import {LMSessionLayer} from "./LMSessionLayer";
import {LMSessionProvider} from "../hooks/useLMSession";

/**
 * An application session
 */
export class LMSession {
    /** The view that can be used to render this session */
    public view: JSX.Element;
    /** The IO context for this session */
    public context: IOContext;
    /** The home UI layer */
    public homeLayer: UILayer;
    /** The unique runtime id of this session */
    public readonly ID = uuid();

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

    /** Listeners that listen for close events */
    protected closeListeners: (() => void)[] = [];

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
        this.context?.destroy();
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
            isInDevMode: h => this.LM.isInDevMode(h),
            undoRedo: new UndoRedoFacility(),
            settings: new SettingsContext(),
            contextMenuBindings: this.getGlobalContextMenuBindings(),
            session: this,
        });

        // Retrieve the settings context from LM which includes all base settings data, and listen for changes
        this.observers.settingsContext = new Observer(h => {
            this.LM.getAppletManager().getApplets(h);
            return this.LM.getSettingsManager().getSettingsContext(h);
        }).listen(settingsContext => {
            this.context.settings = settingsContext;
        }, true);
    }

    /**
     * Retrieves the context menu items that should be global in this session
     * @returns The menu items
     */
    protected getGlobalContextMenuBindings(): IDataRetriever<IActionBinding[]> {
        return hook =>
            this.getApplets(hook).flatMap(applet =>
                applet.globalContextMenuBindings instanceof Function
                    ? applet.globalContextMenuBindings(hook)
                    : applet.globalContextMenuBindings ?? []
            );
    }

    /**
     * Initializes the view for this session
     */
    protected setupView(): void {
        this.view = (
            <LMSessionProvider value={this}>
                <ApplicationLayout key={this.ID} context={this.context} />
            </LMSessionProvider>
        );
    }

    // Sets up the interface
    /**
     * Initializes all the UI
     */
    protected async setupUI(): Promise<void> {
        const menu = await this.setupMenu();
        const field = await this.setupField();

        this.homeLayer = new LMSessionLayer([...menu, ...field]);
        this.context.open(this.homeLayer);
    }

    /**
     * Initializes the menu to be displayed
     */
    protected async setupMenu(): Promise<
        (IStandardUILayerData & {onClose: () => void})[]
    > {
        this.menu = new LMSessionMenu(this.context);

        // Update the selected applet based on what category a given item belongs to
        const appletManager = this.LM.getAppletManager();
        this.observers.menuCursor = new Observer(h => this.menu.getCursor(h)).listen(
            item => {
                if (item) {
                    const category = getCategoryAction.getCategory(item);
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
            onAdd: item => {
                // console.log("Added", item);
                this.menu.addItem(item);
            },
            onRemove: item => {
                // console.log("Removed", item);
                this.menu.removeItem(item);
            },
        });

        // Create the menu key handler
        const {handler, destroy} = createStandardMenuKeyHandler(this.menu, {
            onExit: () => {
                if (this.searchField.get() == "") this.emitClose();
                else this.searchField.set("");
            },
        });

        // Return the UI to be shown:
        return [
            {
                menu: this.menu,
                menuView: <MainMenuView menu={this.menu} />,
                searchable: false,
                menuHandler: handler,
                onClose: destroy,
            },
        ];
    }

    /**
     * Initializes the field to be displayed
     */
    protected async setupField(): Promise<IStandardUILayerData[]> {
        // Create a text field and connect it to the search executer
        this.searchField = new TextField();

        this.observers.search = new Observer(h => this.searchField.get(h)).listen(
            search => {
                const query = {search, context: this.context};
                this.searchExecuter.setQuery(query);
                this.menu?.setQuery(query);
            }
        );
        const highlighter = createHighlighterWithSearchPattern(h =>
            this.searchExecuter.getPatterns(h)
        );

        // Return the UI to be shown
        return [
            {
                field: this.searchField,
                highlighter,
                icon: "search",
            },
        ];
    }

    // Close listeners
    /**
     * Adds a listener that listens for close events
     * @param listener The listener to be added
     */
    public addCloseListener(listener: () => void): void {
        if (!this.closeListeners.includes(listener)) this.closeListeners.push(listener);
    }

    /**
     * Removes a listener that listens for close events
     * @param listener The listener to be removed
     */
    public removeCloseListener(listener: () => void): void {
        const index = this.closeListeners.indexOf(listener);
        if (index != -1) this.closeListeners.splice(index, 1);
    }

    /**
     * Emits the close event
     */
    protected emitClose(): void {
        this.closeListeners.forEach(listener => listener());
    }

    /**
     * Checks whether this session is on the "home screen", I.e. has no menu opens on top
     * @param hook The hook to subscribe to changes
     * @returns Whether on the home screen
     */
    public isHome(hook?: IDataHook): boolean {
        const layers = this.context.getUI(hook);
        return (
            layers[layers.length - 1] == this.homeLayer &&
            this.searchField?.get(hook) == ""
        );
    }

    /**
     * Closes all layers and removes the search input
     * @param close Whether to also exit LM
     */
    public async goHome(close?: boolean): Promise<void> {
        this.searchField.set("");
        if (close) this.emitClose();
        await this.context.closeAll();
    }

    // Applet management
    /**
     * Retrieves the applets initialized with this session data
     * @param hook The hook to subscribe to changes
     * @returns The initialized applets
     */
    public getApplets(hook?: IDataHook): IApplet[] {
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
    public getSearchables(hook?: IDataHook): IMenuSearchable[] {
        return [
            ...this.appletData.get(hook).flatMap(({searchable}) => searchable ?? []),
            ...this.extraSearchables.get(hook),
        ];
    }

    /**
     * The applet data obtained from the applet manager
     */
    public appletData = new DataCacher<
        {
            applet: IApplet;
            initializedApplet: IApplet;
            version: IUUID;
            searchable?: IMenuSearchable;
        }[]
    >((h, currentAppletData = []) => {
        const managerApplets = this.LM.getAppletManager().getAppletsData(h);

        // Dispose the sessions related data for any applet that will no longer exist
        currentAppletData.map(appletData => {
            const stillExists = managerApplets.find(
                ({applet}) => applet == appletData.applet
            );
            if (!stillExists) appletData.initializedApplet.onCloseSession?.();
        });

        // Obtain the new applet data list
        const newData = managerApplets.map(({applet, version}) => {
            let updated = false;
            let searchableID = `${applet.ID}-${version}`;

            // Find the current data for this applet
            const current = currentAppletData.find(({applet: {ID}}) => ID == applet.ID);
            if (current) {
                updated = current.version != version;
                if (!updated) return current;

                // If it has updated, change the search id
                if (current.searchable?.ID == searchableID)
                    searchableID = "updated-" + searchableID;
            }

            // Initialize the new applet
            const initializedApplet = withSession(applet, this);
            if (updated && this.LM.isInDevMode())
                this.callAppletReload(initializedApplet);

            // Obtain the searchable and return the data
            const searchable =
                initializedApplet.search &&
                this.getAppletSearchWithCategory(initializedApplet, searchableID);
            return {initializedApplet, applet, searchable, version};
        });
        return newData;
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
                                  bindings => [...bindings, categoryBinding] //search category takes priority
                              ),
                          },
                      }
                    : result,
        });
    }
}
