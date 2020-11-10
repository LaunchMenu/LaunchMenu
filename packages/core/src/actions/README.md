# What are Actions?

Actions are a way of dynamically obtaining data for a collection of functions.
This is typically used to retrieve functions to be executed on a collection of menu items. Menu items can dynamically add data to be used by these actions.

# How do actions work

## Basics

In its most basic form, actions can be seen as a way of extracting data satisfying a given interface from a collection of data. This data can be anything, but are typically menu items. I will from here on refer to these data elements as items.

We can for instance have an interface for names of items:

```ts
const names = createAction({
    name: "names",
    core: (names: string[]) => ({result: names}),
});
```

When we create an action, like in the example, we must provide a name for it. This name is only used for debugging, and should typically be the same as the variable you store it in.

In addition each action has a `core` which describes what to do with the data. This core needs to return an object with a field `result` which contains the result of the action.
In this very basic example, we simply directly return the exact data that was found from the items.

Now we can create some items to use the action on. All items to apply any kind of actions on should have a property `actionBindings` which is an array of action bindings. This array can be filled with bindings of various actions, to serve as inputs to these actions:

```ts
const item1 = {actionBindings: [names.createBinding("item1")]};
const item2 = {actionBindings: [names.createBinding("item2")]};
const items = [item1, item2];
```

Note that the data passed in the binding is of type string, while we expect a string array in our action.
This is the case because the action will retrieve multiple bindings at once, so the type of the input data will always be an array.

Now we can apply the action to these items, in order to extract all the names of the items:

```ts
names.get(items); // == ["item1", "item2"]
```

Not every item that you apply the action on needs to have a binding to the action, and one item may even have multiple bindings to the same action, so from the result there is no way of figuring how it corresponds to the items. E.g. can't just assume that the first item of items has name "item1", as can be seen in the following example:

```ts
const item1 = {actionBindings: []};
const item2 = {
    actionBindings: [names.createBinding("item2"), names.createBinding("item2Alt")],
};
const item3 = {actionBindings: [names.createBinding("item3")]};
const items = [item1, item2, item3];
names.get(items); // == ["item2", "item2Alt", "item3"]
```

## Multiple actions example

These actions are mainly useful because they allow you to extract data from an interface you know next to nothing about. You know item must contain some kind of bindings array, but you don't know the exact data.
Yet the action is able to extract the relevant data in a way that's intellisense friendly (we always know the result type of the get method of actions) and doesn't interfere with other actions.

We can for instance introduce a second action 'ages' in addition to our 'names' action:

```ts
const names = createAction({
    name: "names",
    core: (names: string[]) => ({result: names}),
});
const ages = createAction({
    name: "ages",
    core: (ages: number[]) => ({result: ages}),
});
```

And create and check bindings for some arbitrary items:

```ts
const item1 = {
    actionBindings: [
        names.createBinding("John"),
        names.createBinding("Johny"),
        ages.createBinding(12),
    ],
};
const item2 = {actionBindings: [ages.createBinding(5)]};
const item3 = {actionBindings: [names.createBinding("Bob")]};
const items = [item1, item2, item3];
names.get(items); // == ["John", "Johny", "Bob"]
ages.get(items); // == [12, 5]
```

The data in these actions can be anything however. So in this particular case it might make sense to combine the data into 1 action, such that we always get name-age pairs:

```ts
const profiles = createAction({
    name: "profiles",
    core: (profiles: {name: string; age: number}[]) => ({result: profiles}),
});
const item1 = {actionBindings: [profiles.createBinding({name: "John", age: 12})]};
const item2 = {actionBindings: [profiles.createBinding({name: "Bob", age: 92})]};
const item3 = {actionBindings: [profiles.createBinding({name: "Emma", age: 19})]};
const items = [item1, item2, item3];
profiles.get(items); // == [{name: "John", age: 12}, {name: "Bob", age: 92}, {name: "Emma", age: 19}]
```

## Reducers

The examples so far have been simple examples where actions just straight up return the data, but we can do more elaborate things.
Because core is a function, we can transform and return the input data in whatever way we want.

We could for instance create some 'list' (verb) interface, which will create a nicely formatted string to list the selection of items:

```js
const list = createAction({
    name: "list",
    core: (names: string[]) => {
        const bulletPointNames = names.map(name => `• ${name}`);
        const bulletPointNamesString = bulletPointNames.join("\n");
        return {
            result: bulletPointNamesString,
        };
    },
});
```

Now we can create some items with bindings to this action, and obtain a nice overview string for these items:

```ts
const item1 = {actionBindings: [names.createBinding("item1")]};
const item2 = {actionBindings: [names.createBinding("item2")]};
const item3 = {actionBindings: [names.createBinding("item3")]};
list.get([item1, item2, item3]); // == "• item1\n• item2\n• item3"
```

## Action handlers

### Mapping

When we make sure that actions take as generic of an input as possible, we make sure that items have the most amount of flexibility in how they decide they want to be used for a given action.

For instance in the previous list example, we decided to put a bullet point in front of all names. However, it might make sense to put another symbol in front of another name.
So it may be a better idea to instead only perform the joining of the strings in the list action:

```js
const list = createAction({
    name: "list",
    core: (names: string[]) => {
        const namesString = names.join("\n");
        return {result: namesString};
    },
});
```

But this means we would need to specify the bullet for each of the items, which seems a bit redundant:

```ts
const item1 = {actionBindings: [names.createBinding("• item1")]};
const item2 = {actionBindings: [names.createBinding("• item2")]};
const item3 = {actionBindings: [names.createBinding("• item3")]};
list.get([item1, item2, item3]); // == "• item1\n• item2\n• item3"
```

To solve this issue, as well as some others, action handlers exist. Action handlers are really just actions themselves, but also specialize some existing 'parent' action.
We do this by making an action return bindings for said parent action, as well as (optionally) its own result

```ts
const listBulletPointHandler = createAction({
    name: "listBulletPointHandler",
    parents: [list],
    core: (names: string[]) => {
        const bulletPointNames = names.map(name => `• ${name}`);
        return {
            children: bulletPointNames.map(bulletPointName =>
                list.createBinding(bulletPointName)
            ),
            result: bulletPointNames,
        };
    },
});
```

You can see 2 important changes compared to regular actions;

-   We specify the parent in the static structure
-   We return a list of children, which is a list of bindings to the parent

Now, bindings to `listBulletPointHandler`'s core function will automatically be transformed to bindings for `list`.

```ts
const item1 = {actionBindings: [listBulletPointHandler.createBinding("item1")]};
const item2 = {actionBindings: [listBulletPointHandler.createBinding("item2")]};
const item3 = {actionBindings: [names.createBinding("- item3")]};
list.get([item1, item2, item3]); // == "• item1\n• item2\n- item3"
```

This allows us to remove the duplicated code, while still allowing instances to deviate from the norm.
We can also obtain the result of `listBulletPointHandler` itself, for cases where purely this data is valuable:

```ts
listBulletPointHandler.get([item1, item2, item3]); // == ["• item1", "• item2"]
```

And we can also introduce different extra standards in the form of additional handlers:

```ts
const listDashHandler = createAction({
    name: "listDashHandler",
    parents: [list],
    core: (names: string[]) => {
        const bulletPointNames = names.map(name => `- ${name}`);
        return {
            children: bulletPointNames.map(bulletPointName =>
                list.createBinding(bulletPointName)
            ),
            result: bulletPointNames,
        };
    },
});

const item1 = {actionBindings: [listBulletPointHandler.createBinding("item1")]};
const item2 = {actionBindings: [listBulletPointHandler.createBinding("item2")]};
const item3 = {actionBindings: [listDashHandler.createBinding("item3")]};
list.get([item1, item2, item3]); // == "• item1\n• item2\n- item3"
```

### Reducing

In the previous example, we could've simply used functions to preprocess the data passed to the list bindings, e.g.:

```ts
const item1 = {actionBindings: [list.createBinding(withBulletPoint("item1"))]};
const item2 = {actionBindings: [list.createBinding(withBulletPoint("item2"))]};
const item3 = {actionBindings: [list.createBinding(withDash("item3"))]};
list.get([item1, item2, item3]); // == "• item1\n• item2\n- item3"
```

However, if we want to combine sets of data, this wouldn't be possible. This is where the action handlers become very useful. Lets imagine we have certain items that are 'special' and in the listing we want to show them all together under a label 'special'.
This is possible, when we create a new action handler for this:

```ts
const specialListItemsHandler = createAction({
    name: "specialListItemsHandler",
    parents: [listBulletPointHandler], // Notice that we can create handlers, for handlers
    core: (names: string[]) => {
        const bulletPointNames = names.map(name => `  * ${name}`);
        const specialList = ["special:", ...bulletPointNames].join("\n");
        return {
            children: [listBulletPointHandler.createBinding(specialList)],
            // Note that we don't return a result, thus specialListItemsHandler.get([...]) on its own is useless
        };
    },
});

const item1 = {actionBindings: [specialListItemsHandler.createBinding("item1")]};
const item2 = {actionBindings: [listBulletPointHandler.createBinding("item2")]};
const item3 = {actionBindings: [listDashHandler.createBinding("item3")]};
const item4 = {actionBindings: [specialListItemsHandler.createBinding("item4")]};
list.get([item1, item2, item3, item4]);
```

Now the result of this get call, with all new lines as actual line feeds, will be:

```
• special:
  * item1
  * item4
• item2
- item3
```

When we call the getter without having any bindings for `specialListItemsHandler` it will never get used, and thus not show up in the listing:

```ts
list.get([item2, item3]); // == "• item2\n- item3"
```

### Input ordering

Where the binding of a handler is placed in the sequence of inputs to an action is based on where in the sequence its inputs were located.
In the `specialListItemsHandler` example data, the first item had a binding that was special, and therefor the special items came at the start.

Generally when handlers reduce actions, their result will get the same location in the sequence as their first input had.
Handlers that purely map data, will also automatically map the input sequence (as could be seen with the list bullet points and dashes).

Here is an example for some other data for the `specialListItemsHandlers` setup, to show the idea:

```ts
const item1 = {actionBindings: [specialListItemsHandler.createBinding("item1")]};
const item2 = {actionBindings: [listBulletPointHandler.createBinding("item2")]};
const item3 = {actionBindings: [listDashHandler.createBinding("item3")]};
const item4 = {actionBindings: [specialListItemsHandler.createBinding("item4")]};

list.get([item2, item1, item3, item4]); // Notice some items are swapped
```

=>

```
• item2
• special:
  * item1
  * item4
- item3
```

```ts
list.get([item2, item4, item3, item1]); // Notice some items are swapped
```

=>

```
• item2
• special:
  * item4
  * item1
- item3
```

```ts
list.get([item2, item3, item4, item1]); // Notice some items are swapped
```

=>

```
• item2
- item3
• special:
  * item4
  * item1
```

Action can decide on how to handle indexing themselves however. Core receives its inputs' indices as a second argument, and the standard `createBinding` method allows for passing of an index to override the default.
This way we can for instance specify that all bullet point items should show up in 1 continuous sequence after the first bullet point item:

```ts
const listBulletPointHandler = createAction({
    name: "listBulletPointHandler",
    parents: [list],
    core: (names: string[], indices: number[]) => {
        const bulletPointNames = names.map(name => `• ${name}`);
        return {
            children: bulletPointNames.map(bulletPointName =>
                list.createBinding({data: bulletPointName, index: indices[0]})
            ),
            result: bulletPointNames,
        };
    },
});

const item1 = {actionBindings: [listDashHandler.createBinding("item1")]};
const item2 = {actionBindings: [listBulletPointHandler.createBinding("item2")]};
const item3 = {actionBindings: [listBulletPointHandler.createBinding("item3")]};
const item4 = {actionBindings: [listDashHandler.createBinding("item4")]};
const item5 = {actionBindings: [listBulletPointHandler.createBinding("item5")]};
list.get([item1, item2, item3, item4, item5]);
```

=>

```
- item1
• item2
• item3
• item5
- item4
```

## Multiple parents

Actions can also have multiple parents. This allows a single binding to be used in multiple situations.
We can for instance create an action handler that creates bindings for both the `names` and `list` actions of earlier:

```ts
const namesAndBulletPointListHandler = createAction({
    name: "namesAndBulletPointListHandler",
    parents: [names, listBulletPointHandler],
    core: (inpNames: string[]) => ({
        children: [
            ...inpNames.map(name => listBulletPointHandler.createBinding(name)),
            ...inpNames.map(name => names.createBinding(name)),
        ],
    }),
});

const item1 = {actionBindings: [namesAndBulletPointListHandler.createBinding("item1")]};
const item2 = {actionBindings: [namesAndBulletPointListHandler.createBinding("item2")]};
const item3 = {actionBindings: [namesAndBulletPointListHandler.createBinding("item3")]};
list.get([item1, item2, item3]); // == "• item1\n• item2\n• item3"
names.get([item1, item2, item3]); // == ["item1", "item2", "item3"]
```

## Efficiency

The process of retrieving the correct result for a given action is rather complex.
It involves:

-   Going through all items and their action bindings
-   Mapping out the static action graph
-   Determining a sequence of executing the required handlers
-   Executing the actions in this sequence, to arrive at the final result

Because of this, the system is relatively slow and has a lot of overhead. In some cases where efficiency is important, this system should be avoided.
In certain situations where efficiency is important, it could still be used however. If you will make multiple repeated calls, but these calls are all on the same data, the action system can still be used.

And this brings us to another common action pattern in LaunchMenu; function factories:

```ts
type Func = {
    /** @returns Whether the function was successful */
    execute: () => boolean;
};

const doSomething = createAction({
    name: "doSomething",
    core: (funcs: Func[]) => ({
        result: {
            execute: () =>
                funcs.reduce((allPassed, func) => allPassed && func.execute(), true),
        },
    }),
});
```

This action will obtain an object with an 'execute' function, and returns whether all items executed successfully.

```ts
const item1 = {
    actionBindings: [
        doSomething.createBinding({
            execute: () => {
                console.log("hoi");
                return true;
            },
        }),
    ],
};
const item2 = {
    actionBindings: [
        doSomething.createBinding({
            execute: () => {
                console.log("bye");
                return true;
            },
        }),
    ],
};
const executer = doSomething.get([item1, item2]);
executer.execute(); // == true  and logs "hoi" followed by "bye"
```

This way we can call execute however often we want, with barely any overhead. And an added bonus of this technique is that the `get` function is side-effect free (which is what you expect from a getter). Instead all side-effects happen whenever the retriever function is called.

This function factory pattern is totally combinable with all previous discussed topics too. The ideas of actions handlers and ordering, etc apply in exactly the same way.

## Subscribing to data

Not all items are necessarily immutable. So their action bindings might also change over time.
As mentioned before, getting results of actions is kind of performance heavy, so polling items to check for these changes would be quite bad.

For that reason, model-react is used in order to allow for listening to changes. Items can change their bindings in two ways:

-   Updating the data of a specific binding
-   Adding/removing bindings

The first one will require only the action that the binding is for to recompute. The latter one will require all the actions that the item has bindings for to recompute, and is thus rather heavy. But this fortunately only occurs when the item changes, rather than on a continuous loop.

### Specific binding change

In order to change the data of a specific binding, we must have some sort of data source to store the data in.
The most straight forward data source is a `Field`. Then we can make a binding with a function as input, which will forward a data hook to subscribe to changes:

```ts
const item1Name = new Field("item1");
const item1 = {
    actionBindings: [
        listDashHandler.createBinding({subscribableData: h => itemName.get(h)}),
    ],
};
const item2 = {actionBindings: [listDashHandler.createBinding("item2")]};
```

Now we can use one of multiple ways to listen to the data. The `get` method of all actions allow a hook to be passed, which will then be forwarded to the items. We can for instance use an `Observer` to create a sort of stream:

```ts
const listObserver = new Observer(h => list.get([item1, item2], h)).listen(listing => {
    console.log(listing);
}, true);

item1Name.set("bob");
```

This will result in 2 calls, one initial call because we specified `true` for whether to create an initial call when adding a listener, and one when we change item1's name to "bob":

-   `"- item1\n- item2"`
-   `"- bob\n- item2"`

### Adding/removing bindings

In order to add or remove bindings, we must make the list of bindings itself subscribable. We can do this by storing the list of bindings in some data source, and pass a retriever for this as the action bindings:

```ts
const item1Bindings = new Field([listDashHandler.createBinding("item1")]);
const item1 = {actionBindings: h => item1Bindings.get(h)};
const item2 = {actionBindings: [listDashHandler.createBinding("item2")]};
```

Now we can use one of multiple ways to listen to the data. The `get` method of all actions allow a hook to be passed, which will then be forwarded to the items. We can for instance use an `Observer` to create a sort of stream:

```ts
const listObserver = new Observer(h => list.get([item1, item2], h)).listen(listing => {
    console.log(listing);
}, true);

item1Bindings.set([]);
```

This will result in 2 calls, one initial call because we specified `true` for whether to create an initial call when adding a listener, and one when we change item1's bindings change:

-   `"- item1\n- item2"`
-   `"- item2"`

# Common usage in LaunchMenu

The action system is commonly used in LaunchMenu for menu items. It allows us to attach functionality to these menu items. And typically actions will retrieve functions that can be executed by the user, through the context menu system.
