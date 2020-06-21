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