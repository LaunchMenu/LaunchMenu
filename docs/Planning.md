# LaunchMenu

## Expectations
* [ ] General behaviour
    * Focussed on being controlled via Keyboard only (mouse optional)
* [x] Quick Search [implDetail](Querying%20in%20the%20LaunchMenu%20search%20bar)
    * Search across multiple applets at once
    * Search for applets based on current context (e.g. window open prior to LaunchMenu) 
    * Sort result items and applets according to priority assigned by them
* [x] App Specific Search [implDetail](#Selecting%20applets)
    * Let applet decide whether to open based on search (opting out of quicksearch)
    * Program selection applet to select applets without knowing their specific patterns
        * Implemented as an applet, and will have to know its pattern by heart
    * When an applet is opened, a new instance of the class is created
* [ ] Creating Menu Items [implDetail](#Creating%20Menu%20Items)
* [ ] Modularity of 3 areas and stacks
* [ ] How to shelve applications with their state to later return to
* [ ] Undo/Redo
* [ ] Settings
* [ ] Applet installation


* Specific Applets
    * App Search 
    * File Search
    * Generic Console Application for use with other/any language (node/irb/python/js)
    * ...




## API stuff

### Querying in the LaunchMenu search bar

- Ask all applets for results on search query
- Applets return generator
- LM calls generator on some event loop to obtain results
- Results limited to top matches via settings
- Default result limit is 10 per app
- LM categorizes per app, and sorts apps based max priority within results (potentially according to settings)
- LM provides some standard categorisation bands (Low, Medium, High, Urgent)
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
    static * getQueryItems(query: IQuery): Generator<ISearchResult, undefined> {
       yield ...;
    }
    // ...
}

LM.registerApplet(Applet);
```


### Selecting applets

- Applet to select other applets from list (likely with special syntax e.g. `>\s+MyApp`)
- Each applet has a static function to return applet info
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
    // ...
}

LM.registerApplet(Applet);
```

### Creating Menu Items

```tsx
function createMenuItem(): ISearchItem {
    
    // ... Realistically hidden behind some abstraction, but you could also do this if needed:
    const createLMItem = ({text, icon, content, onClick})=>{
        let contentID: number;
        return {
            view: ({selected, onClick})=>{
                return <div onClick={onClick}>{text} {icon}</div>;
            },
            onSelect: (selected: boolean)=>{
                if(content){
                    if(selected) contentID = LM.addContent(content);
                    else LM.removeContent(contentID);
                }
            },
            onClick,
        };
    };
    
    yield {
        item: createLMItem({
            text:"crap", 
            icon:"shit", 
            content: <ContentLayout date={} name={}>extra data</ContentLayout>, 
            onClick: ()=>{}}
        ),
        priority: 1
    }
}


// Usage from LM
const p: createMenuItem();

let myHandler;
<p.item selected={true} registerOnPress={(handler)=>{
    myHandler = handler
}}/>

```