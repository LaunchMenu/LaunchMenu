// import {React} from "react";
// type ILMContext = number;
// type IApplet = {
//     doShit(): number;
// };
// type IAppletClass = {
//     new (context: ILMContext): IApplet;
//     doOtherShit(): boolean;
// };
// type IAppContext = {
//     appID: string;
//     getSubContext(name: string): IAppContext;
// };
// export const declare = <C extends IAppletClass>(
//     declaration: (context: IAppContext) => C
// ) => declaration;

// export default declare(({appID}) => {
//     return class Applet implements IApplet {
//         constructor(context: ILMContext) {}
//         doShit() {
//             return 5;
//         }
//         doPoop() {
//             return "test";
//         }

//         static poop(): string {
//             return "3";
//         }
//         static doOtherShit() {
//             return true;
//         }
//     };
// });

// let ContentLayout;
// let contentPane;
// let createContextItem;
// let createContextItemCategory;
// let menuPane;

// type IMenuItemView = FC<{selected: boolean; onClick: () => void; search: string}>;
// type IMenuItem = {
//     view: IMenuItemView;
//     onSelect: (selected: boolean) => void;
//     onClick: () => void;
//     onSearch: (search: string) => Generator<IMenuItem, undefined>;
//     onFilter: (search: string) => boolean;
// };
// type ISearchResult = {
//     priority: number;
//     item: IMenuItem;
// };

// function createShitItem(): ISearchResult {
//     // ... Realistically hidden behind some abstraction, but you could also do this if needed:
//     const createLMItem = ({text, icon, content, onClick}) => {
//         let contentID: number;
//         return {
//             view: ({selected, onClick}) => {
//                 return (
//                     <div onClick={onClick}>
//                         {text} {icon}
//                     </div>
//                 );
//             },
//             onSelect: (selected: boolean, firstSelect: boolean) => {
//                 if (content) {
//                     if (selected) contentID = content.stack.push(content.item);
//                     else content.stack.pop(contentID);
//                 }
//             },
//             onClick,
//             onSearch: () => {},
//         };
//     };

//     return {
//         item: createLMItem({
//             text: "crap",
//             icon: "shit",
//             content: {
//                 item: (
//                     <ContentLayout date={} name={}>
//                         extra data
//                     </ContentLayout>
//                 ),
//                 pane: contentStack,
//             },
//             onClick: () => {},
//         }),
//     };
// }

// type IMenuItemView = FC<{selected: boolean; onClick: () => void; search: string}>;
// type IMenuItem = {
//     [view]: IMenuItemView;
//     onSelect: (selected: boolean) => void;
//     onClick: () => void;
//     onSearch: (search: string, path: string) => Generator<ISearchResult, undefined>;
// };
// type ISearchResult = {
//     priority: number;
//     item: IMenuItem;
// };

// createMenuItem({
//     text: "crap",
//     icon: "shit",
//     content: {
//         item: (
//             <ContentLayout date={} name={}>
//                 extra data
//             </ContentLayout>
//         ),
//         pane: contentPane,
//     },
//     contextMenu: {
//         items: [
//             createContextItem({
//                 icon: "shit",
//                 text: "doShit",
//                 onClick: () => {},
//             }),
//             createContextItemCategory({
//                 icon: "shit2",
//                 text: "doShit2",
//                 children: [
//                     createContextItem({
//                         icon: "shit3",
//                         text: "doShit3",
//                         onClick: () => {},
//                     }),
//                 ],
//                 pane: menuPane,
//             }),
//         ] as IMenuItem[],
//         pane: menuPane,
//     },
//     onClick: () => {},
// });

// type Shit<I, M> = {p: I; k: M};
// type K<P> = {
//     skunk: {<I>(executor: (bindingItems: I[]) => number): Shit<I, K<P>>};
//     m: P;
// };

// let p: K<boolean>;

// const h = p.skunk((items: string[]) => {
//     return 3;
// }).k.m;

//Fake test types
type FC<P> = P;
type IMenu = number;

let createAction = <I, O>(actionCore: IActionCore<I, O>): IAction<I, O> => {
    return null; // Actual implementation would go here
};

type IActionHandlerBinding<I> = {
    handler: IActionHandler<any, I, any>;
    items: IMenuItem[];
}[];
type IActionCore<I, O> = (handlers: IActionHandlerBinding<I>) => O;
type IAction<I, O> = {
    // readonly createHandler: {
    //     <T>(handlerCore: IActionHandlerCore<T, I>): IActionHandler<T, I, IAction<I, O>>;
    // }; //commented for markdown highlighting.
    readonly createHandler: <T>(
        handlerCore: IActionHandlerCore<T, I>
    ) => IActionHandler<T, I, IAction<I, O>>;
    readonly get: (items: IMenuItem[]) => O;
};
type IActionHandlerCore<I, O> = (bindingData: I[]) => O;
type IActionHandler<I, O, A extends IAction<any, any>> = {
    readonly action: A;
    readonly createBinding: (data: I) => IActionBinding<I>;
    readonly get: (bindingData: I[] | IMenuItem[]) => O;
};
type IActionBinding<I> = {
    readonly handler: IActionHandler<any, any, IAction<any, any>>;
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

// Test implementation
const addCountsAction = createAction(
    (handlers: IActionHandlerBinding<{name: string; count: number}>) => {
        return {
            execute: () => {
                return handlers.map(({handler, items}) => handler.get(items));
            },
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
        view: null,
        actionBindings: [pathCount.createBinding({path: "bang"})],
    },
    {
        view: null,
        actionBindings: [pathCount.createBinding({path: "foo"})],
    },
];

addCountsAction.get(items).execute(); // [{name: "path length" count: 7}]
