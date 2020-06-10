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
* [x] How to shelf applications with their state to later return to.
    * Create a new query by hitting win+space again.
    * Have a menu to switch between applications.
    * Close top application by hitting escape.
* [ ] Mnemonics
* [ ] Undo/Redo.
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
    static * getQueryItems(query: IQuery, panes: IPaneStacks): Generator<ISearchResult, undefined> {
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
    public constructor(controls: IPaneStacks){

    }
    ...
}
```


# How to shelf applications with their state to later return to

- Create new instance using the normal win+space shortcut.
- Opens ontop of the current stack.
- Shift+tab to switch between instances.
- Implementation wise:
    - Push new substack when opening instance.
    - Remove substack and add again when switching to instance.
    - These instances need to be tracked by something.

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
- 
- About
- Help
