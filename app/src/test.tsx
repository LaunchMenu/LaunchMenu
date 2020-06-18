import {React} from "react";
type ILMContext = number;
type IApplet = {
    doShit(): number;
};
type IAppletClass = {
    new (context: ILMContext): IApplet;
    doOtherShit(): boolean;
};
type IAppContext = {
    appID: string;
    getSubContext(name: string): IAppContext;
};
export const declare = <C extends IAppletClass>(
    declaration: (context: IAppContext) => C
) => declaration;

export default declare(({appID}) => {
    return class Applet implements IApplet {
        constructor(context: ILMContext) {}
        doShit() {
            return 5;
        }
        doPoop() {
            return "test";
        }

        static poop(): string {
            return "3";
        }
        static doOtherShit() {
            return true;
        }
    };
});

let ContentLayout;
let contentPane;
let createContextItem;
let createContextItemCategory;
let menuPane;

type IMenuItemView = FC<{selected: boolean; onClick: () => void; search: string}>;
type IMenuItem = {
    view: IMenuItemView;
    onSelect: (selected: boolean) => void;
    onClick: () => void;
    onSearch: (search: string) => Generator<IMenuItem, undefined>;
    onFilter: (search: string) => boolean;
};
type ISearchResult = {
    priority: number;
    item: IMenuItem;
};

function createShitItem(): ISearchResult {
    // ... Realistically hidden behind some abstraction, but you could also do this if needed:
    const createLMItem = ({text, icon, content, onClick}) => {
        let contentID: number;
        return {
            view: ({selected, onClick}) => {
                return (
                    <div onClick={onClick}>
                        {text} {icon}
                    </div>
                );
            },
            onSelect: (selected: boolean, firstSelect: boolean) => {
                if (content) {
                    if (selected) contentID = content.stack.push(content.item);
                    else content.stack.pop(contentID);
                }
            },
            onClick,
            onSearch: () => {},
        };
    };

    return {
        item: createLMItem({
            text: "crap",
            icon: "shit",
            content: {
                item: (
                    <ContentLayout date={} name={}>
                        extra data
                    </ContentLayout>
                ),
                pane: contentStack,
            },
            onClick: () => {},
        }),
    };
}

type IMenuItemView = FC<{selected: boolean; onClick: () => void; search: string}>;
type IMenuItem = {
    [view]: IMenuItemView;
    onSelect: (selected: boolean) => void;
    onClick: () => void;
    onSearch: (search: string, path: string) => Generator<ISearchResult, undefined>;
};
type ISearchResult = {
    priority: number;
    item: IMenuItem;
};

createMenuItem({
    text: "crap",
    icon: "shit",
    content: {
        item: (
            <ContentLayout date={} name={}>
                extra data
            </ContentLayout>
        ),
        pane: contentPane,
    },
    contextMenu: {
        items: [
            createContextItem({
                icon: "shit",
                text: "doShit",
                onClick: () => {},
            }),
            createContextItemCategory({
                icon: "shit2",
                text: "doShit2",
                children: [
                    createContextItem({
                        icon: "shit3",
                        text: "doShit3",
                        onClick: () => {},
                    }),
                ],
                pane: menuPane,
            }),
        ] as IMenuItem[],
        pane: menuPane,
    },
    onClick: () => {},
});
