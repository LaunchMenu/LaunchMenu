import {Field} from "model-react";
import React from "react";
import {IOContext} from "../../context/IOContext";
import {IMenuSearchable} from "../../menus/actions/types/search/_types/IMenuSearchable";
import {createMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
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
import {prioritizedRedoMenuItem} from "../../undoRedo/ui/redoMenuItem";
import {prioritizedUndoMenuItem} from "../../undoRedo/ui/undoMenuItem";
import {UndoRedoFacility} from "../../undoRedo/UndoRedoFacility";
import {Observer} from "../../utils/modelReact/Observer";
import {SearchExecuter} from "../../utils/searchExecuter/SearchExecuter";
import {ApplicationLayout} from "../components/ApplicationLayout";
import {LaunchMenu} from "../LaunchMenu";
import {v4 as uuid} from "uuid";

/**
 * An application session
 */
export class LMSession {
    public view: JSX.Element;
    public context: IOContext;
    public readonly id = uuid();

    protected lm: LaunchMenu;

    protected searchObserver: Observer<string>;
    protected searchField: TextField;
    protected menu: PrioritizedMenu;

    protected searchables = new Field([] as IMenuSearchable[]);
    protected searchExecuter: SearchExecuter<IQuery, IPrioritizedMenuItem>;

    /**
     * Creates a new app session
     * @param lm The LM instance this is a session for
     */
    public constructor(lm: LaunchMenu) {
        this.lm = lm;

        this.setupContext();
        this.setupView();
        this.setupUI();
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
    }

    /**
     * Retrieves the context menu items that should be global in this session
     * @returns The menu items
     */
    protected getGlobalContextMenuItems(): IPrioritizedMenuItem[] {
        return [prioritizedUndoMenuItem, prioritizedRedoMenuItem];
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
                id: "root",
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
            fieldHandler: createTextFieldKeyHandler(this.searchField, false, () => {
                console.log("detect");
            }),
        });
    }

    /**
     * Initializes the content to be displayed
     */
    protected setupContent(): void {
        this.context.openUI({content: <Box padding="large">LM is great m8</Box>});
    }
}
