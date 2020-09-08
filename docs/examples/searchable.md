```ts
type ISearchables = ISearchable | ISearchable[];
type ISearchable = {
    id: string | number,
    search(query: IQuery, hook: IDataHook): {
        item?: IPrioritizedMenuItem;
        children: ISearchable[];
    }
}

const item = createMenuItem({name: "bob"});
const id = uuid();
const searchable: ISearchable = {
    id,
    search(query, hook) {
        return {
            // The item and its priority
            item: {
                priority: 1,
                item,
            } as IPrioritizedMenuItem,
            // The next dependent item searches
            children: [] as ISearchable[],
        }
    }
}
```