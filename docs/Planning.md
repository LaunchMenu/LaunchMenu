178# LaunchMenu

## Expectations
* [ ] General behaviour.
    * Focussed on being controlled via Keyboard only (mouse optional).
* [ ] Coding conduct
    * Typings: 
        * All types begin with I, e.g. `IInstance`, `IMenu`, `IColorPicker`, ...
            * Benefit: can search `I*.ts` for types
            * Benefit: can easily tell something is an interface, not an actual class etc
        * 1 type per file
        * Keep types close to where they are needed, preferably in a '_types' folder.
        * All types exported from files.
        * Have an index file which imports all types, classes, functions and exports them again.
    * VSCode workspace?
    * Use prettier for automatic formatting
    * Attempt to keep things OOP
    * Git:
        * Create feature branches:
            * E.G. feature/settingsHandler
            * Merge development into your branch before merging to development
        * Use master as development for versions being tested (but should in theory work)
        * Create release branches as E.G. release/v1
        * TODO: git commit message conventions
* [X] Applet Format [implDetail](#Applet%20format).
* [ ] Menu [implDetail](#Menu).
    * TODO:
    * Consists of interaction handler and visual representation.
        * Will be in charge of creating content themselves when applicable.
    * Will have helpers to create consistent looking items.
* [ ] Multi-item selection.
* [x] Quick Search [implDetail](Querying%20in%20the%20LaunchMenu%20search%20bar).
    * Search across multiple applets at once.
    * Search for applets based on current context (e.g. window open prior to LaunchMenu).
    * Sort result items and applets according to priority assigned by them.
* [x] App Specific Search [implDetail](#Selecting%20applets).
    * Let applet decide whether to open based on search (opting out of quicksearch).
    * Program selection applet to select applets without knowing their specific patterns.
        * Implemented as an applet, and will have to know its pattern by heart.
    * When an applet is opened, a new instance of the class is created.
* [x] Modularity of 3 areas and stacks [implDetail](#Modularity%20of%203%20areas%20and%20stacks).
    * All 3 areas will be panes containing stacks of views.
    * Any react elements can be added to the stack.
    * Only top N(=2?) opaque views will be rendered.
    * Substacks can be added to stacks to allow for shielding.
* [x] How to shelf applications with their state to later return to [implDetail](#How%20to%20shelf%20applications%20with%20their%20state%20to%20later%20return%20to).
    * Create a new session by hitting win+space again.
    * Have a menu to switch between sessions.
    * Close top session by hitting escape.
* [ ] Fields and LaunchMenu Search bar
    * 
* [X] Mnemonics [implDetail](#Mnemonics)
    * Create Mnemonics data context (storing whether Mnemonics should be shown, and what keys are pressed)
    * Create Mnemonics component that uses the context and triggers activation
    * Mnemonic has callback handler to trigger action (e.g. click button, focus text field, ...)
* [X] Undo/Redo. [implDetail](#Undo/Redo)
    * Undo redo in global context
    * Ctrl Z, Ctrl Y
    * Undo redo is provided as a LM wide system, which is unique to the session.
    * Undo redo works by submitting undoable commands to undoSystem for execution/reversion
    * Space given for asynchronous commands (for running in parallel etc)
    * Can potentially have issues when transferring large files while heavily multitasking, more about this later.
* [ ] Settings.
    * Settings based on schema containing value and ui react components.
    * Setting react component displayed by launch menu system when user wants to change settings.
    * Settings stored as JSON file.
    * Settings system passes appID via appContext which is the identifier to find settings for that applet in the JSON file. 
* [ ] Applet installation.
    * Can instantiate other applets within applet. E.G. Using a color picker within your own applet.

* [ ] Themes and styling

* Specific Applets
    * App Search .
    * File Search.
    * Generic Console Application for use with other/any language (node/irb/python/js).
    * ...

* [ ] Late goals
    * Debug view/render Menu item priority
    * Translation


## API stuff

* LM singleton instance for API accessible through import
* LM singleton available in window object (for debugging, scripting, experimentation)

### Applet format
<details>
<summary>Show detail</summary>

Types:

```tsx
type ILMContext = {
    ...
};
type IApplet = {
    ... // (E.G. someRequiredMethod)
};
type IAppletClass = {
    new (context: ILMContext): IApplet;
    ... // (E.G. someRequiredStaticMethod)
};
type IAppContext = {
    appID: string;
    ...
};

// Some helper to check typings
export const declare = <C extends IAppletClass>(
    declaration: (context: IAppContext) => C
) => declaration;

export default {
    declare
};
```

Defining plugin:
```tsx
import {declare, IApplet, ILMContext} from "@launchmenu/core";

export default declare((appContext) => {
    return class Applet implements IApplet {
        public static someRequiredStaticMethod(): string {
            return ...;
        }
        public static somePluginSpecificStaticMethod(): boolean {
            return ...;
        }
        
        constructor(context: ILMContext) {}
        
        public someRequiredMethod(): string {
            return ...;
        }
        public somePluginSpecificMethod(): number {
            return ...;
        }
    };
});
```
</details>


### Modularity of 3 areas and stacks

- Each of the 3 program sections will have a 'stack' of ReactElements.
- Topmost element of stack is the visible element.
- Can add IStackItems, which are specific react components, allowing any content to be displayed.
- Only render top 2 opaque elements (+ all transparent elements on-top) in stack (stack will be virtual).
- Push null to the stack to hide stack pane (i.e. pane is hidden when null element is topmost element of stack).
- Protection against applications popping react elements off stack prior to their launch.
    - By supplying application a 'substack' that they can add to and remove from. 


```tsx
type ILMContext = {
    panes: IPaneStacks
}

type IStackItem = FC<{width: number, height: number, onTop: boolean, index: number}>;
type IEventID = string;
type IContentID = string;
type IViewStack = {
    // Transition speed and existence controlled by settings
    push(view: IStackItem | IViewStack, transparent?: boolean, size?:{width: number, height: number}): IContentID; 
    insert(view: IStackItem | IViewStack, transparent?: boolean, size?:{width: number, height: number}): IContentID; // Advise rarely used
    remove(ID: IContentID): void;
    pop(ID?: IContentID): void; // Only pop if ID is topmost item

    get(topOffset?: number): {view: IStackItem, transparent: boolean, size:undefined|{width: number, height: number}};
    
    addEventListener(eventName: "add"|"beforeReplace"|"beforeRemove"|"beforePop",callback: ()=>void): IEventID;
    removeEventListener(ID: IEventID): void;
}
type IPaneStacks = {
    search: IViewStack,
    menu: IViewStack,
    content: IViewStack,
}
```
```tsx
...
export default declare((appContext) => {
    class Applet implements IApplet {
        public constructor(context: ILMContext){

        }
        ...
    }
});
```


### Menus
#### Menu 
<details>
<summary>Show detail</summary>
A menu in LM is a list on the (typically) left side of the screen, which contains items that can be navigated through and interacted with using the keyboard. 

The menu handles tracking of selected items and triggering them, but the items themselves specify their design and behavior.

```tsx
type IMenuItem = { ... }
type IPrioritizedMenuItem = {
    priority: number;
    item: IMenuItem;
};
type IGeneratorCallback<T> =
    /**
     * A callback to pass items that were generated
     * @param item The generated item
     * @returns A promise that resolves once the next item should be retrieved, when the last item to be retrieved is passed, the promise will return true (last requested item)
     */
    (item: T) => Promise<boolean>;
type IMenuItemCallback = IGeneratorCallback<IPrioritizedMenuItem>;

class Menu {
    public static populateFromGenerator(generator: (cb: IMenuItemCallback)=>Promise<void>, menu: Menu): void;
    public static populateFromArray(items: IMenuItem[], menu: Menu): void;

    // For searching a menu see SearchField class

    public constructor(maxItemCount?: number){}
    public addItem(item: IPrioritizedItem): void;
    public addItem(item: IMenuItem, index:number = Infinity): void;
    public removeItem(item: IPrioritizedItem): void;
    public removeItem(item: IMenuItem): void;
    
    public setSelected(item: IMenuItem, selected: boolean = true): void;
    public setCursor(item: IMenuItem): void;

    public getItems(h: IDataHook): IMenuItem[];
    public getSelectedItems(h: IDataHook): IMenuItem[];
    public getCursor(h: IDataHook): IMenuItem;

    public view: IStackItem; 
}


//Potentially need this
class WindowedMenu extends Menu {}
```
 
 Menus will expect items to have common actions it can use:
 - onCursor -> Returns boolean to indicate whether cursor can move to this item.
 - onSelect -> Returns boolean to indicate whether item is selectable.
 - onExecute
 - search 
 - getCategory (Optional) -> Returns a MenuItem representing the category header.

##### Categorization of items
The menu will use the getCategory action for on each item to retrieve the item's category item header.
Items will be grouped based on category, and sorted within their category and priority. Categories are sorted amongst each other based on either average or top priority (setting?).
MenuItems can easily represent category headers by specifying they are not selectable and by showing an appropriate view.

</details>

#### What are menu items
<details>
<summary>Show detail</summary>

- Menu Items will be combination of a view component and action bindings.
- Menu Items can add extra behavior/interaction through their view, which won't be controlled by the menu.
- Actions are things that can be executed on certain menu items:
    - Handlers can be added to actions to describe what the action should do for a particular item.
        - Action handler is implemented outside the MenuItem
        - This action handler has a semi static/global implementation
        - Action handlers are to be used by many different implementations of MenuItems
            - This is required behavior for multi-item selection actions.
        - Action can have multiple implementations:
            - E.G. "Copy" action could have different implementations for:
                 - CopyText - Copies text to clipboard
                 - CopyImage - Copies image data to clipboard
                 - CopyFile  - Copies file item to clipboard (OS specific)
                 - CopyCompoundFile - Copies multiple file items to clipboard (which are represented as a single file in LM)
                 - ...
        - Applets can implement their own ActionHandlers
    - Items will have bindings to action handlers. 
    - The binding contains item specific data to be used on execution.
    - Either actions or action handlers can be called on a set of items
    - LM has a couple of built-in actions:
        - onCursor: Called when item becomes cursor or stops being cursor
        - onSelect: Called when item is selected or stops being selected
        - onExecute: Called when item was selected and is either clicked again or EXECUTE_KEY button is pressed.
- Applets can implement their own Menus and MenuItems.

```tsx
// Action 
type IActionHandlerItems<I> = {
    handler: IActionHandler<any, I, any>;
    items: IMenuItem[];
}[];
type IActionCore<I, O> = (handlers: IActionHandlerItems<I>) => O;
class Action<I, O> implements Action<I, O> {
    public constructor(actionCore: IActionCore<I, O>) { }
    
    public createHandler<T>(
        handlerCore: IActionHandlerCore<T, I>
    ): IActionHandler<T, I, Action<I, O>> {
        return null;
    }
    public get(items: IMenuItem[]): O {
        return null;
    }
}
// Action handler
type IActionHandlerCore<I, O> = (bindingData: I[]) => O;
type IActionHandler<I, O, A extends Action<any, any>> = {
    readonly action: A;
    readonly createBinding: (data: I) => IActionBinding<I>;
    readonly get: (bindingData: I[] | IMenuItem[]) => O;
};
// Item
type IActionBinding<I> = {
    readonly handler: IActionHandler<any, any, Action<any, any>>;
    readonly data: I;
    readonly tags: string[];
};
type IMenuItemView = FC<{
    readonly isCursor: boolean;
    readonly isSelected: boolean;
    readonly item: IMenuItem;
    readonly menu: IMenu;
}>;
type IMenuItem = {
    readonly view: IMenuItemView;
    readonly actionBindings: IActionBinding<any>[];
};
```

Test example:
```tsx
// Test implementation
const addCountsAction = new Action(
    (handlers: IActionHandlerItems<{name: string; count: number}>) => {
        return {
            execute: () => {
                return handlers.map(({handler, items}) => handler.get(items));
            }
        };
    }
);

// Add path length handler
const pathCount = addCountsAction.createHandler((items: {path: string}[]) => {
    return {
        name: "path length",
        count: items.reduce((cur, {path}) => cur + path.length, 0),
    };
});

// Use action on your items
const items = [
    {
        view: ({selected})=><div>{selected?"I am selected":"I am not selected"}</div>,
        actionBindings: [pathCount.createBinding({path: "bang"})],
    },
    {
        view: ({menu, item})=>
            <div onClick={menu.select(item)}>{selected?"I am selected":"I am not selected"}</div>,
        actionBindings: [pathCount.createBinding({path: "foo"})],
    },
];

addCountsAction.get(items).execute(); // [{name: "path length" count: 7}]
```
</details>

#### Context menu for multiple selected items
<details>
<summary>Show detail</summary>
TODO: describe how to aggregate views of actions from a selected set of items

</details>


#### Our wrappers of menu items

<details>
<summary>Show detail</summary>
- Simple function to create standard items will be provided by LM.


TODO: Code example moved to ADL


```tsx
const menuItem: IMenuItem = createLMItem({
    text:"crap", 
    icon:"shit", 
    content: {
        item: <ContentLayout date={} name={}>extra data</ContentLayout>,
        pane: contentStack
    }, 
    onClick: ()=>{}
});
```
</details>

#### Searching/filtering menu items

<details>
<summary>Show detail</summary>

TODO: write about wtf is going on


```tsx
/**
 * Search action test
 */
type IQuery = {
    raw: string;
    context: {
        currentWindow: {
            title: string;
            id: string | number;
        };
        clipboard: {
            // ...
        };
    };
    historicWindows: [/* ...? */];
};
```

```tsx
// Test implementation
type ISearchAble = {
    search: (search: IQuery, callback: IMenuItemCallback) => Promise<void>;
};
const searchAction = new Action((handlers: IActionHandlerItems<ISearchAble>) => {
    return {
        search: async (search: IQuery, push: IMenuItemCallback) => {
            for (const {handler, items} of handlers) {
                await handler.get(items).search(search, push);
            }
        },
    };
});

// Add path length handler
const searchHandler = searchAction.createHandler((items: ISearchAble[]) => {
    return {
        search: async (search: IQuery, push: IMenuItemCallback) => {
            for (const item of items) {
                await item.search(search, push);
            }
        },
    };
});

// Use action on your items
const myChildren = [] as IMenuItem[];
const searchItems = [
    {
        view: null,
        actionBindings: [
            searchHandler.createBinding({
                search: async (search: IQuery, push: IMenuItemCallback) => {
                    await push({priority: Infinity, item: null as IMenuItem});
                    await searchAction.get(myChildren).search(search, push);
                },
            }),
        ],
    },
];

// Performing search
const Utils: any = null;
const generatorCallback = Utils.createGeneratorCallback((item: IPrioritizedMenuItem) => {
    // do smth
});
searchAction.get(searchItems).search(null as IQuery, generatorCallback);
setTimeout(() => {
    generatorCallback.stop();
}, 5000);
```
</details>

#### Context menu through actions

<details>
<summary>Show detail</summary>

</details>

### Fields

### Querying in the LaunchMenu search bar

- Ask all applets for results on search query.
- Applets return generator.
- LM calls generator on some event loop to obtain results.
- Results limited to top matches via settings.
- Default result limit is 10 per app.
- LM categorizes per app, and sorts apps based max priority within results (potentially according to settings).
- LM provides some standard categorisation bands (Low, Medium, High, Urgent).
- Categorisation based on Apps could be like the following:
```
Option 1.
    Dictionary
    |- Hamster
    |- Hamsterine

    Articles
    |- Hamster
    |- HamsterPie

Option 2.
    Dictionary Hamster
    Articles   Hamster
    Dictionary HamsterPoop
    Articles   HamsterPie
```

```tsx
class SearchField {
    /**
     * Menu passed for ability to search the menu
     */ 
    constructor(menu: Menu){
        
    }
}
```

<!-- 
```tsx
type ILMContext = {}; // Expanded upon in future chapters

type IQuery = {
    raw: string,
    context: {
        currentWindow: {
            title: string,
            id: string|number
        },
        clipboard : {
            // ...
        }
    },
    historicWindows: [
        // ...?
    ]
};

type IMenuItemView = FC<{selected: boolean, onClick: ()=>void, search: string, context: IMenuContext}>;
type IMenuItem = {
    view: IMenuItemView,
    interfaces: {
        [Interaction]: {
            [OnExecute]: (menuContext: IMenuContext)=>{},
            [OnSelect]: (selected: boolean)=>void; 
            [OnSearch]: (search: string, path: string)=>Generator<ISearchResult, undefined>;
        },
        [MainContextMenu]: {
            [OnExecuteContext]:{
                execute: ()=>{}
                text: "Open"
            },
            [ICopyImageData]: {

            },
            [ICopyFile]: {
                path: string,
            },
            [ICopyCompoundFile]: {
                getSourcePaths(): string[],
                getDestinationPaths(source: string, destDir: string): string,
            },
            [IShellScriptID]: {
                getPathOfScript(): string
            }
        }
    }
};

// What items to show?

ICopyCompoundFile = Symbol("Copy");

LM.registerActionUI(ICopyPasteHandler, shit as (...args: any[])=>Generator<IMenuItem>);

LM.registerActionExecuter(ICopyPasteHandler, ICopyCompoundFile, {
    onCopy: shit, 
    onPaste: shit
});

// Where to register handlers?
//Globally (Menu)

const createContextMenu = createContextMenuCreator([{
    name: "copy",
    onExecute: (path: string)=>Clipboard.createPushFileCommand(path)
}]);


const file = ...;
const contextMenu = createContextMenu(file.getPath());


context.getSelectedChildren()

type ISearchResult = {
    priority: number,
    item: IMenuItem
};
```

```tsx
// Register action (ICopyPasteAction) type for menu items
// Actions don't have any consistent interface at all, though ones used for the context menu should have a consistent getUI function
Menu.registerAction(ICopyPasteAction, (handlers: {handler: any, items: IMenuItem[]}[])=>{
    const onCopy = () => {
        handlers.forEach({handler, items})=>{
            handler.onCopy();
        });
    }
    const copyMenuItem = {
        view: ({selected})=>{
            return <div>Copy</div>
        },
        interfaces: {
            [Interaction]: {
                [OnExecute]: (menuContext: IMenuContext)=>onCopy(),
                [OnSelect]: (selected: boolean)=>void; 
                [OnSearch]: (search: string, path: string)=>Generator<ISearchResult, undefined>;
            },
        }
    };
    return ({
        onCopy,
        copyMenuItem,
        * getUI(){
            return copyMenuItem
        }
    })
});

//Register different implementations of Action, (here 2 ICopyFile and ICopyCompoundFile)
Menu.registerActionExecuter(ICopyPasteAction, ICopyFile, (items: {path: string}[])=>{
    onCopy: ()=>{
        items.forEach(item=>{
            // do shit;
        });
        // do other combined shit here
    }, 
    onPaste: ()=>{

    }
});
Menu.registerActionExecuter(ICopyPasteAction, ICopyCompoundFile, (items: 
        {
            getSourcePaths(): string[],
            getDestinationPaths(source: string, destDir: string): string,
        }[])=>{
   
    // Compound files have the ability to display 1 file (e.g. test.tab) but copy both files simultaneously to their new destination I.e. Behave as 1 file.
    // ------------------------------------
    // test.tab   -> copy -> copies test.tab and test.dat
    // -> paste into ./poop/ -> pastes to ./poop/test.tab and ./poop/test.dat

    onCopy: ()=>{
        items.forEach(item=>{
            // do shit;
        });
        // do other combined shit here
    }, 
    onPaste: ()=>{

    }
});

// Programmatic usage of actions
LM.getActionHandler(ICopyPasteAction, selectedItems as IMenuItem[]).onCopy();

// Example context menu ui usage of actions
const myFile = {
    view: ({context})=>{
        useEffect(()=>{
            const handler = ()=>{
                const items: IMenuItem[] = context.getSelectedItems();
                const foundActions = {} as {[action: any]: IMenuItem[]};
                items.forEach(item=>
                    getItemContextMenuInterfaces(item).forEach(interface=>{
                        const action = getInterfaceAction(interface);
                        if(!(action in foundActions))
                            foundActions[action] = [];
                        foundActions[action].push(item);
                    });
                );
                const items: Generator<IMenuItem>[] = Object.keys(foundActions).map(action=>{
                    return context.getActionHandler(action, foundActions[action]).getUI?.();
                }).filter(ui=>ui);
                stack.push(new Menu(generatorArrayToGenerator(items)));
            };

            registerHandler("tab", handler);
            return ()=>removeHandler("tab", handler);
        }, []);

        return <div>Bob</div>;
    },
    interfaces: {
        [Interaction]: {
            [OnExecute]: (menuContext: IMenuContext)=>{
                alert('Bob!');
            },
            [OnSelect]: (selected: boolean)=>void; 
            [OnSearch]: (search: string, path: string)=>Generator<ISearchResult, undefined>;
        },
        [MainContextMenu]: {
            [OnExecuteContext]:{
                execute: ()=>{
                    alert('Bob!')
                }
                text: "Amazeballz"
            },
            [ICopyFile]: {
                path: "bob",
            },
            [ICopyCompoundFile]: {
                getSourcePaths(): string[],
                getDestinationPaths(source: string, destDir: string): string,
            },
            [IShellScriptID]: {
                getPathOfScript(): string
            }
        }
    }
}
```


```tsx
...
export default declare((appContext) => {

    return class Applet implements IApplet {
        static * getQueryItems(query: IQuery, context: ILMContext): Generator<ISearchResult, undefined> {
            yield ...;
        }
        ...
    }
}
``` -->


### Selecting applets

- Applet to select other applets from list (likely with special syntax e.g. `>\s+MyApp`).
- Each applet has a static function to return applet info.
- Applet info used in various places: app search, settings, etc.

```ts
type IAppletInfo = {
    views: {
        menu: IMenuItemView
        content: FC
    }, 
    name: string, 
    description: string, 
    icon: string, 
    tags: string[]
}

```
```tsx
...
export default declare((appContext) => {
    return class Applet implements IApplet {
        /** Optional method? */
        static matchesAppPattern(query: IQuery): boolean {
            // Example:
            return /F:.+/.test(query.raw);
        }
        /** 
         * Can get elements for use in settings and name for app search.
         * Quick Search uses this for name + icon etc.
        */
        static getAppletInfo(): IAppletInfo {
            //
        }
        ...
    }
});
```


### How to shelf applications with their state to later return to

- Create new sessions using the normal win+space shortcut.
- Opens ontop of the current stack.
- Shift+tab to switch between sessions.
- Implementation wise:
    - Push new substack when opening sessions.
    - Remove substack and add again when switching to session.
    - These sessions need to be tracked by something.

### Context menus
#### Applet Context Menu
- (tab) Open context menu for selected item


```tsx

// Item creation with context example
createMenuItem({
    text:"crap", 
    icon:"shit", 
    content: {
        item: <ContentLayout date={} name={}>extra data</ContentLayout>,
        pane: contentPane
    }, 
    contextMenu: {
        items: [createContextItem({
            icon: "shit",
            text: "doShit",
            onClick: ()=>{},
        }), createContextItemCategory({
            icon: "shit2",
            text: "doShit2",
            children: [createContextItem({
                icon: "shit3",
                text: "doShit3",
                onClick: ()=>{},
            })],
            pane: menuPane
        })] as ReactElement[],
        pane: menuPane
    },
    onClick: ()=>{}
});
```

#### Global Context Menu (F1) with mnemonics

- (esc) &Close
- (shift+esc) &Hide
- (win+space) &New Instance
- (shift+tab) Switch &Instances 
- &Settings
- ???? (alt) Show Mnemonics

- (ctrl+z) Undo
- (ctrl+y) Redo

- About
- Help


### Mnemonics
- Mnemonics to initially be created for alt followed by single key press.
- Later implementation (unless easy) to do it for a sequence of presses (e.g. alt-f-o for File>Open or Group-Group-Button or whatever)
- Will use react context to pass visibility information to element and mnemonic class will handle triggering based on activation data.
- Different settings for Hovering Box showing key vs highlight character in text ...e 
- Add interface to `MnemonicContext` controller to programmatically call mnemonics 


```tsx
import MnemonicContext from "...";

const Mnemonic = ({text, key, onTrigger})=>{
    const {isShown, activatedMnemonics}: {isShown: boolean, activatedMnemonics: string[]} 
        = useContext(MnemonicContext);
    
    const activated = activatedMnemonics.includes(key);
    useEffect(()=>{
        if(activated) onTrigger();
    }, [activated]);

    if(isShown)
        return <div>{text}: {key}</div>
    return <div>{text}</div>
}

// Single key
shit = <div><Mnemonic text="oranges" key="o" onTrigger={()=>console.log("shit")} /></div>

// Multiple keys
shit = <div><Mnemonic text="oranges" key={["f","o"]} onTrigger={()=>console.log("shit")} /></div>
```

### Undo/Redo
- Interface used for "reversable commands", which are passed to UndoRedoFacility
- Undo redo is unique to LaunchMenu session (recall win+space launches new session)
- Undo and Redo commands are available in global context menu
- Text field which considers idle detection in undo/redo mapping
- ComposableCommands classes to batch commands
- 'addToBatch' flag to automatically combine with the previous command for batching
- When first executing a command, it will instantly be executed, even if previously executed commands haven't finished yet
    - When undoing a command it will have to wait for prior undone commands to finish reverting
    - When redoing a command it will have to wait for prior redone commands to finish executing


```tsx
type ILMContext = {
    panes: IPaneStacks,
    undoFacility: IUndoRedoFacility
};


type IUndoRedoFacilityState = "undoing" | "redoing" | "ready";
type IUndoRedoFacility = {
    execute(command: ICommand, addToBatch: boolean|(previous: ICommand)=>boolean): Promise<void>;
    /** Alias of execute(EmptyCommand, false) */
    splitBatch(): void;
    undo(): Promise<void>;
    redo(): Promise<void>;
    getState(hook: IDataHook): IUndoRedoFacilityState;
}


type ICommandState = "executing" | "reverting" | "executed" | "ready";
type ICommand = {
    execute(): Promise<void>;
    revert(): Promise<void>;
    getState(hook: IDataHook): ICommandState;
}

// Waits until a certain predicate becomes true
const waitFor = (cb:(hook:IDataHook)=>boolean)=>getAsync(h=>{
    if(!cb(hook)) h.markIsLoading();
});

class ComposableCommand implements ICommand {
    protected commands: ICommand[];
    protected executingIndex = 0;
    protected state = new Field("ready" as ICommandState);

    public constructor(commands: ICommand[]){
        this.commands = commands;

        // If there are any commands executing, state is executing, if one command is executed, state is executed, otherwise state is ready
        this.state.set(commands.reduce((cur, cmd)=>{
            const s = cmd.getState();
            if(s=="executing") return s;
            if(s=="executed" && cur=="ready") return s;
            return cur;
        }, "ready" as ICommandState));
    }

    async execute(){
        if(this.state.get()!="ready") throw Error("Can only revery command if ready");
        this.state.set("executing");
        for(; executingIndex<this.commands.length; executingIndex++){
            const cmd = this.commands[executingIndex];
            if(cmd.getState()=="ready")
                await cmd.execute();
            if(cmd.getState()=="executing")
                await waitFor(h=>cmd.getState(h)=="executed");
        }
        this.state.set("executed");
    }
    async revert(){
        if(this.state.get()!="executed") throw Error("Can only revery command if executed");
        this.state.set("reverting");
        for(executingIndex-=1; executingIndex>=0; executingIndex--){
            const cmd = this.commands[executingIndex];
            await cmd.revert();
        }
        this.state.set("ready");
    }
    getState(hook?: IDataHook){
        return this.state.get(hook);
    }
}

// Suggested people don't use this in general since it's dangerous, don't you know that your toxic!
class AugmentableComposableCommand extends ComposableCommand {
    async push(cmd: ICommand){
        if(cmd.getState()!="ready") throw Error("Fuck you");
        this.commands.push(cmd);
        const state = this.getState();

        if(state == "ready"){
            // Nothing needs to happen, stuff is ready to be executed
        }else if(state == "executing"){
            // Just execute the command right away, when the ComposableCommand gets to 'execute' this command, it will just wait until the executed state is reached
            await cmd.execute();
        } else if(state == "executed"){
            // Make sure the state is still accurate, NOTICE: it's possible that a command goes into executing state after already have been executed
            this.state.set("ready");
            this.execute(); 
        } else if(state == "reverting"){
            // Nothing has to happen, this command is already ready
        }
    }
}
```

Example usage of commands for typing
```tsx
const facility: IUndoRedoFacility;
const someField: Field<String>;

const TextField = ()=>{
    const [h] = useDataHook();
    useEffect(()=>{
        //LM OnIdle event achieved via polling power-monitor electron APIs
        //https://www.electronjs.org/docs/api/power-monitor#methods
        const listenerID = LM.addEventListener("OnIdle",()=>{
            facility.splitBatch();
        });
        return ()=>LM.removeEventListener(listenerID);
    });

    return <TextField 
        value={someField.get(h)} 
        onChange={(v)=>facility.execute(new FieldChangeCommand(someField, v), true)}>;
}
```

Example usage of commands for moving files as a batch
```ts
let files = [
    {file: "a/b/a.txt", to: "newDest/a.txt"},
    {file: "a/b/b.txt", to: "newDest/b.txt"},
    {file: "a/b/c.txt", to: "newDest/c.txt"}
];
facility.execute(new ParallelComposableCommand(files.map(({file, to})=>new FileMoveCommand(file, to))));

class ParallelComposableCommand implements ICommand {
    protected commands: ICommand[];
    protected state = new Field("ready" as ICommandState);

    public constructor(commands: ICommand[]){
        this.commands = commands;
    }

    async execute(){
        this.state.set("executing");
        await Promise.all(this.commands.map(cmd=>cmd.execute()));
        this.state.set("executed");
    }
    async revert(){
        this.state.set("reverting");
        await Promise.all(this.commands.map(cmd=>cmd.revert()));
        this.state.set("reverted");
    }
    getState(hook?: IDataHook){
        return this.state.get(hook);
    }
}
```


### Settings
* LaunchMenu generates ID (likely the file path), stores in IAppContext and passes this to Applet class.
* `appContext.getSettings` takes an argument which takes a "schema" for the settings. In this you can pass a default initial value and the UI used to modify the settings value.
* 

```tsx

type ISettingSchema = {
    default: any,
    ui: FC<{context: ILMContext, curValue: any, onChange:(newValue: any)=>void, settings: ISettings}>
};
type ISettingSchemaDir = {[name: string]: ISettingSchemaDir} | ISettingSchema;

type ISettingsSchema = {
    version: string|number,
    settings: {[name: string]:ISettingSchemaDir}
};

type ISettingsValues = {
    version: string|number;
    settings: {[name: string]:any}
}

type IAppContext = {
    appID: string;
    getSettings: (getSchema: 
        (oldSchema:ISettingsValues)=>Promise<ISettingsSchema>|ISettingsSchema
    )=>Promise<ISettings>;   
}

// Exposed plugin util function
export const declare = <C extends IAppletClass>(
    declaration: (context: IAppContext)=>C
) => declaration;

```

```tsx
type ISetting<T> = IMenuItem & {
    get(hook: IDataHook): T
    set(v: T): void
};
type ISettingGroup<T extends {[name: string]: ISettingGroup}> = (IMenuItem & {
    children: T,
}) | ISetting;


```


```tsx
...
export default declare((appContext: IAppContext)=>{  
    const settings = await appContext.createSettings((currentlyStored)=>({
        version: "1",
        settings: {
            crap: createSettingsCategory({
                name: "bob",
                children: {
                    shit: createSetting({default: 5, ui: null}),
                }
            }),
            stuff: createSetting({default: 5, ui: null})
        },
        settingsRenderer: ui
    }));

    const crap = settings.crap.children;
    crap.shit.get();
    settings.get("crap.shit");
    
    return class Applet implements IApplet {
        //...
    }   
});
```



```tsx
type IAppContext = {
    appID: string;
    getSettings: (getSchema: 
        (oldSchema:ISettingsValues)=>Promise<ISettingsSchema>|ISettingsSchema
    )=>Promise<ISettings>;   
    getSubContext(name: string) : IAppContext;
}
```
```tsx
export default declare((appContext: IAppContext)=>{  
    const ColorPickerClass = ColorPicker(appContext.getSubContext("color picker"));
    // NOTE: getSubContext and getSettings error if called after the applet has been returned
    
    return class Applet implements IApplet {
        //...
    }   
});
```
