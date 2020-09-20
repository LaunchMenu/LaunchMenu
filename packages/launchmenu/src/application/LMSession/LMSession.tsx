import {Field, IDataHook} from "model-react";
import React from "react";
import {IOContext} from "../../context/IOContext";
import {IMenuSearchable} from "../../menus/actions/types/search/_types/IMenuSearchable";
import {PrioritizedMenu} from "../../menus/menu/PrioritizedMenu";
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
    public menu: PrioritizedMenu;

    /** The searchable sources */
    public searchables = new Field([] as IMenuSearchable[]);
    /** The search executer responsible for making the searches */
    public searchExecuter: SearchExecuter<IQuery, IPrioritizedMenuItem>;

    // Observers that track changes
    protected settingsContextObserver: Observer<SettingsContext>;
    protected appletObserver: Observer<IApplet[]>;
    protected searchObserver: Observer<string>;

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
        this.appletObserver.destroy();
        this.searchObserver.destroy();
        this.settingsContextObserver.destroy();
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
        this.settingsContextObserver = new Observer(h =>
            this.LM.getSettingsManager().getSettingsContext(h)
        ).listen(settingsContext => {
            this.context.settings = settingsContext;
        }, true);
    }

    /**
     * Retrieves the context menu items that should be global in this session
     * @returns The menu items
     */
    protected getGlobalContextMenuItems(): (hook: IDataHook) => IPrioritizedMenuItem[] {
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
        const menu = new PrioritizedMenu(this.context);
        this.context.openUI({
            menu,
            searchable: false,
        });

        // Setup a search executer
        this.searchExecuter = new SearchExecuter({
            searchable: {
                ID: "root",
                search: async (query, hook) => ({
                    children: this.searchables.get(hook),
                }),
            },
            onAdd: item => menu.addItem(item),
            onRemove: item => menu.removeItem(item),
        });
    }

    /**
     * Initializes the field to be displayed
     */
    protected setupField(): void {
        // Create a text field and connect it to the search executer
        this.searchField = new TextField();

        this.searchObserver = new Observer(h => this.searchField.get(h)).listen(
            search => {
                const query = {search};
                this.searchExecuter.setQuery(query);
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
        this.context.openUI({content: <Box padding="large">LM is great m8</Box>});
    }

    // Sets up the applets in this session
    /**
     * Initializes the applets within this context
     */
    protected setupApplets(): void {
        let first = true;
        this.appletObserver = new Observer(h =>
            this.LM.getAppletManager().getApplets(h)
        ).listen((applets, _, prevApplets) => {
            const newApplets = first
                ? applets
                : applets.filter(applet => !prevApplets.includes(applet));

            // Obtain the new searchables
            const oldSearchables = this.searchables.get(null);
            const searchables = applets.flatMap(applet => {
                if (applet.search) {
                    // Make sure the id changes if the applet changed, to make the search pick up on it
                    if (
                        newApplets.includes(applet) &&
                        oldSearchables.find(({ID: id}) => id == applet.ID)
                    ) {
                        return {
                            ...applet,
                            ID: "updated-" + applet.ID,
                        } as IMenuSearchable;
                    } else return applet as IMenuSearchable;
                } else return [];
            });
            this.searchables.set(searchables);

            // Initialize the new applets
            if (DEV)
                newApplets.forEach(applet => {
                    const disposer = applet?.development?.onReload?.(this);
                    if (disposer)
                        this.LM.getAppletManager().addAppletDisposer(applet.ID, disposer);
                });

            first = false;
        }, true);
    }
}
