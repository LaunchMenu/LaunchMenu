# 1. Function oriented vs Class oriented 
There are 2 options for generating MenuItems: FullOOP and a more Functional Approach.
Both of these approaches still create objects, and can therefor be considered object oriented. 
The example below is a mock of an outdated IMenuItem interface, but is still of use for comparing the two styles. 

## Comparison
```tsx    
/**
 * Pros:
 * - Lambda expressions within the code feel okay here.
 * - Variables easier to access (`this.item.content.stack` --> content.stack).
 * - Not very verbose, little boiler plate.
 * Note:
 * - Although it doesn't feel appropriate to comment methods directly in this view, comments can be added to interface, where intellisense is still provided.
 * Cons:
 * - More difficult to split large methods into multiple methods (need to export methods separately in the module.)
 * - Can't extend an item, have to rely on composability instead.
 *      - Only works if people nicely split up their code.
 * - Easy to forget IMenuItem return typing and thus miss out on intellisense of view/onSelect/onClick methods.
 * - Can't use Generators from Lambda Expressions.
 *      - Will have to use 'function' syntax instead, which breaks consistency.
 * - Can more easily become messy if made by new coders.
 */ 
const createLMItem = ({text, icon, content, onClick}): IMenuItem => {
    let contentID: number;
    return {
        view: ({selected, onClick})=>{
            return <div onClick={onClick}>{text} {icon}</div>;
        },        
        onSelect: (selected: boolean)=>{
            if(content){
                if(selected) contentID = content.stack.push(content.item);
                else content.stack.pop(contentID);
            }
        },
        onClick,
    };
};

/**
 * Pros:
 * - Feels more structured.
 * - Can extend Items to make super elements.
 * - More inclined to split large methods up in multiple methods, since it's quite easy
 *      - This allows for reuse of sub methods when the class is extended
 * - Feels appropriate to comment methods directly above where they are defined.
 * - Can easily and cleanly write generator functions.
 * - Motivates users/indie-developers to keep clean code for Applets.
 * Cons:
 * - Lambda expressions don't feel as proper here.
 *      - Lambda expressions are preferable however, in order to pass functions around.
 *      - If lambda expressions aren't used (maybe by mistake), things will error at runtime, not compile time.
 * - Code becomes a lot more verbose with a lot of boilerplate.
 * - Variables aren't as easy to access.
 */ 
class BaseLMItem implements IMenuItem {
    protected item;
    protected contentID: number;
    public constructor(item) {
        this.item = item;
    }
    public view = ({selected, onClick})=>{
        return <div onClick={onClick}>{this.item.text} {this.item.icon}</div>;
    }
    public onSelect = (selected: boolean)=>{
        if(this.item.content){
            if(selected) this.contentID = this.item.content.stack.push(this.item.content.item);
            else this.item.content.stack.pop(contentID);
        }
    }
    public onClick = ()=>this.item.onClick();
}
```

## Decisions

### Use Functional approach when:
* Where there are many expected implementations of an Object.
    * A lot of our internal 'helper'/wrapper code (e.g code dealing Settings, UI, Undo/Redo...) will take this approach
    * For any react component (functional components instead of class component).

### Use Class based approach when:
* Where there is only 1 expected implementation of an Object.
    * For custom built applets
    * As much as possible when implementation of generators are required
    * For Utilities like `Clipboard`

# 2. Usage of generators for menu item retrieval
For certain applications, such as the file system, there may be a huge number of items that can be loaded to the menu. Rather than freezing the UI and or showing a loader while all data is loading at once, we want to be able to load items in batches. This way we can show an immediate result, and slowly refine the result.

## Options
There are several ways we could go about this, some of which are listed below.

### Specifying ranges with variables
We could simply pass a 'offset' and 'length' variable to specify what items we want.
E.G.
```tsx
function getItems(offset: number, length: number) {
    return someCollection.slice(offset, offset + length).map(()=>{...});
}
```

This however becomes problematic with recursive functions, such as you will encounter in file retrieval (due to existence of directories)


```tsx
function getItems(filePath: string, offset: number, length: number) {
    const file = getFile(filePath);
    if(file.isDir){
        const files = file.getFiles();
        // How do we jump to offset? We would have to know per file whether it is a directory and if so how many files it contains. 
        // So this would either require some caching of the information, or covering all items up to offset on every call, making it almost useless.
    }else{
        return [file];
    }
}
```

### Async/await
We could pass some argument as a callback and rely on async await syntax to pause execution.
E.G.
```tsx
async function getItems(filePath: string, callback: (item: any)=>Promise) {
    const file = getFile(filePath);
    await callback(file);

    // Recurse through the children
    if (file.isDir) {
        const files = file.getFiles();
        for (const f of files) {
            await getItems(f, callback);
        }
    }
}
```

Here the callback function we pass can control when the next item should come through by resolving the promise it returns

### Generator functions
We could make use of generators to neatly 'pause' execution using the yield statement.
E.G.
```tsx
async function* getItems(filePath: string) {
    const file = getFile(filePath);
    yield file;

    // Recurse through the children
    if (file.isDir) {
        const files = file.getFiles();
        for (const f of files) {

            // Forward all items of the child iterator
            const gen = getItems(f);
            let item = gen.next();
            while (item.done !== true) {
                yield item.value;
                item = gen.next();
            }
        }
    }
}
```

Or similarly with some helper tools:
```tsx
async function getItems(filePath: string) {
    const file = getFile(filePath);
    const gen = GeneratorUtils.fromArray([file])
    if (file.isDir) {
        const files = file.getFiles();
        
        return GeneratorUtils.concat(
            gen, 
            GeneratorUtils.flatten(
                GeneratorUtils.map(
                    GeneratorUtils.fromArray(files),
                    file => getItems(filePath)
                )
            )
        ); // Not any better really in the end
    } else {
        return gen;
    }
}
```

Now we can just use a 'next' statement on a generator to get a single item repeatedly until there are no items left.

## Discussion
The first option clearly doesn't seem like a good idea, so this one can be dismissed immediately.

### Speed comparison
Async await syntax (which could be used for pausing execution)
```tsx
let m = Promise.resolve();
async function n(){
    let b = 0;
    for (let i = 0; i < 1_000_000; i++) {
        await m;
        b += 1; // Just some fake computation
    }
}
console.time();
n().then(()=>console.timeEnd()); // ~1800ms (70ms with console closed...)
```

Generator syntax (also used to pause execution)
```tsx
function * generator(){
    let b = 0;
    for (let i = 0; i < 1_000_000; i++) {
        yield i;
        b += 1; // Just some fake computation
    }
}

console.time();
let gen = generator();
let item = gen.next();
while(!item.done){
    item = gen.next();
}
console.timeEnd(); // ~35ms
```

These tests have been performed both in the electron window and chrome.

### Pros/cons

Async/await functions:
Pros:
- Very easy to read and write
- Just two awaits required per item
- Event loop can still process user input in between any callbacks
Cons:
- May forget to await calls (potentially detectable, such that we can throw an error)
- Have to pass a callback function
- Potentially A large overhead if other events creep in between

Generator functions:
Pros:
- Very little overhead
- Can be executed completely synchronously if required
- Essential part to pause execution (yield) can't be forgotten
Cons:
- Unfamiliar syntax to most developers
- Writing recursion becomes a little nasty
- Tooling doesn't help much in improving readability
- Requires as many yields per item as the recursive depth it's located at
- Will need to manually batch get item calls on a timer (in order for event loop to still execute)


Asymptotically async/await will be faster, requiring O(n) awaits compared to O(n * d) yields. 
Where n is the number of items to iterate over, and d is the average item depth. 

The async await syntax however has potential for other events to creep in between, and even something seemingly passive as opening the console already slows down the process significantly.

## Decision
- The async/await approach was chosen for all generator like functionality in LaunchMenu
- Main reasons being:
  - Cleaner syntax
  - No unfamiliar syntax
- Hopefully the overhead will be acceptable