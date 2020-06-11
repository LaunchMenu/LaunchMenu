# LaunchMenu

## Expectations
* [ ] General behaviour.
    * Focussed on being controlled via Keyboard only (mouse optional).
* [x] Quick Search [implDetail](Querying%20in%20the%20LaunchMenu%20search%20bar).
    * Search across multiple applets at once.
    * Search for applets based on current context (e.g. window open prior to LaunchMenu).
    * Sort result items and applets according to priority assigned by them.
* [x] App Specific Search [implDetail](#Selecting%20applets).
    * Let applet decide whether to open based on search (opting out of quicksearch).
    * Program selection applet to select applets without knowing their specific patterns.
        * Implemented as an applet, and will have to know its pattern by heart.
    * When an applet is opened, a new instance of the class is created.
* [x] Creating Menu Items [implDetail](#Creating%20Menu%20Items).
    * Consists of interaction handler and visual representation.
        * Will be in charge of creating content themselves when applicable.
    * Will have helpers to create consistent looking items.
* [x] Modularity of 3 areas and stacks [implDetail](#Modularity%20of%203%20areas%20and%20stacks).
    * All 3 areas will be panes containing stacks of views.
    * Any react elements can be added to the stack.
    * Only top N(=2?) opaque views will be rendered.
    * Substacks can be added to stacks to allow for shielding.
* [x] How to shelf applications with their state to later return to [implDetail](#How%20to%20shelf%20applications%20with%20their%20state%20to%20later%20return%20to).
    * Create a new session by hitting win+space again.
    * Have a menu to switch between sessions.
    * Close top session by hitting escape.
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
* [ ] Applet installation.


* Specific Applets
    * App Search .
    * File Search.
    * Generic Console Application for use with other/any language (node/irb/python/js).
    * ...




## API stuff

* LM singleton instance for API accessible through import
* LM singleton available in window object (for debugging, scripting, experimentation)


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

type IMenuItemView = FC<{selected: boolean, onClick: ()=>void}>;
type IMenuItem = {
    view: IMenuItemView,
    onSelect: (selected: boolean)=>void,
    onClick: ()=>void,
};
type ISearchResult = {
    priority: number,
    item: IMenuItem
};

class Applet implements IApplet {
    static * getQueryItems(query: IQuery, context: ILMContext): Generator<ISearchResult, undefined> {
       yield ...;
    }
    ...
}

LM.registerApplet(Applet);
```


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

class Applet implements IApplet {
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

LM.registerApplet(Applet);
```

### Creating Menu Items

- Simple function to create standard items will be provided by LM.
- Items will be combination of a view component and interaction handlers.
- Items can still add extra behavior/interaction through their view.
- Menu items will add/remove content.
- 

```tsx
function createMenuItem(): ISearchItem {
    
    // ... Realistically hidden behind some abstraction, but you could also do this if needed:
    const createLMItem = ({text, icon, content, onClick})=>{
        let contentID: number;
        return {
            view: ({selected, onClick})=>{
                return <div onClick={onClick}>{text} {icon}</div>;
            },
            onSelect: (selected: boolean, firstSelect: boolean)=>{
                if(content){

                    if(selected) contentID = content.stack.push(content.item);
                    else content.stack.pop(contentID);
                }
            },
            onClick,
        };
    };
    
    return {
        item: createLMItem({
            text:"crap", 
            icon:"shit", 
            content: {
                item: <ContentLayout date={} name={}>extra data</ContentLayout>,
                pane: contentStack
            }, 
            onClick: ()=>{}
        }),
        priority: 1
    }
}


// Usage from LM
const {item, priority}: createMenuItem();
<item.view selected={true} onClick={item.onClick}/>;
```

# Modularity of 3 areas and stacks

- Each of the 3 program sections will have a 'stack' of ReactElements.
- Topmost element of stack is the visible element.
- Can add **any** ReactElement to stack.
- Only render top 2 opaque elements in stack (stack will be virtual).
- Push null to the stack to hide stack pane (i.e. pane is hidden when null element is topmost element of stack).
- Protection against applications popping react elements off stack prior to their launch.
    - By supplying application a 'substack' that they can add to and remove from. 


```tsx
type ILMContext = {
    panes: IPaneStacks
}
type IEventID = string;
type IContentID = string;
type IViewStack = {
    // Transition speed and existence controlled by settings
    push(view: ReactElement | IViewStack, transparent?: boolean, size?:{width: number, height: number}): IContentID; 
    insert(view: ReactElement | IViewStack, transparent?: boolean, size?:{width: number, height: number}): IContentID; // Advise rarely used
    remove(ID: IContentID): void;
    pop(ID?: IContentID): void; // Only pop if ID is topmost item

    get(topOffset?: number): {view: ReactElement, transparent: boolean, size:undefined|{width: number, height: number}};
    
    addEventListener(eventName: "add"|"beforeReplace"|"beforeRemove"|"beforePop",callback: ()=>void): IEventID;
    removeEventListener(ID: IEventID): void;
}
type IPaneStacks = {
    search: IViewStack,
    menu: IViewStack,
    content: IViewStack,
}

class Applet implements IApplet {
    public constructor(context: ILMContext){

    }
    ...
}
```


# How to shelf applications with their state to later return to

- Create new sessions using the normal win+space shortcut.
- Opens ontop of the current stack.
- Shift+tab to switch between sessions.
- Implementation wise:
    - Push new substack when opening sessions.
    - Remove substack and add again when switching to session.
    - These sessions need to be tracked by something.

## Context menus
### Applet Context Menu
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
            })]
            pane: menuPane
        })] as ReactElement[],
        pane: menuPane
    },
    onClick: ()=>{}
});
```

### Global Context Menu (F1) with mnemonics

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


# Mnemonics
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

## Undo/Redo
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

