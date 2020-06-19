# Menu Actions

Real world example of using menu actions

Disclaimer: Example slightly outdated

```tsx
// Create an action
const CopyPasteAction = createAction((handlers: {handler: any, items: IMenuItem[]}[])=>{
    const onCopy = () => {
        handlers.forEach({handler, items})=>{
            handler.onCopy();
        });
    }
    const copyMenuItem = {
        view: ({selected})=>{
            return <div>Copy</div>
        },
        actionBindings: [ 
            OnExecute.create((menuContext: IMenuContext)=>onCopy()), 
            OnSelect.create((selected: boolean)=>{}),
            OnSearch.create((search: string, path: string)=>()),
        ]
    };

    // Similar thing would go here for paste
    return ({
        onCopy,
        copyMenuItem,
        * getUI(){
            return copyMenuItem
        }
    })
});

// Create action handlers
const CopyFile = CopyPasteAction.registerHandler((items: {path: string}[])=>{
    onCopy: ()=>{
        items.forEach(item=>{
            // do shit;
        });
        // do other combined shit here
    }, 
    onPaste: ()=>{

    }
});
const CopyCompoundFile = CopyPasteAction.registerHandler((items: {path: string}[])=>{
    onCopy: ()=>{
        items.forEach(item=>{
            // do shit;
        });
        // do other combined shit here
    }, 
    onPaste: ()=>{

    }
});


// Programmatic usage of action
CopyPasteAction.get(selectedItems as IMenuItem[]).onCopy();

// Example context menu ui usage of actions
const myFile = {
    view: ({context})=>{
        useEffect(()=>{
            const handler = ()=>{
                const items: IMenuItem[] = context.getSelectedItems();
                const foundActions = [] as {action: IAction, items: IMenuItem[]}[];
                items.forEach(item=>
                    getActionHandlers(item, "context").forEach(handler=>{
                        const action = handler.getAction();
                        let fa = foundActions.find(({action: a})=>action==a);
                        if(!fa)
                            foundActions.push(fa = {action, items: []});
                        fa.items.push(item);
                    });
                );
                const items: Generator<IMenuItem>[] = foundActions.map(({action, items})=>{
                    return action.get(items).getUI?.();
                }).filter(ui=>ui);
                stack.push(new Menu(generatorArrayToGenerator(items)));
            };

            registerHandler("tab", handler);
            return ()=>removeHandler("tab", handler);
        }, []);

        return <div>Bob</div>;
    },
    actionBindings: [
        OnExecute.create((menuContext: IMenuContext)=>{
            alert('Bob!');
        }) as {handler: OnExecute, data: any, tags: string[]}}, 
        OnSelect.create((selected: boolean)=>{}),
        OnSearch.create((search: string, path: string)=>()),
        OnExecuteContext.create({
            execute: ()=>{
                alert('Bob!')
            }
            text: "Amazeballz"
        }),
        CopyFile.create({path: "bob"}),
        CopyCompoundFile.create({
            getSourcePaths: ()=>["oop"],
            getDestinationPaths: (source: string, destDir: string)=>["shit"],
        })
    ]
}
```