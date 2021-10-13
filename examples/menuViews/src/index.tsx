import React, {FC} from "react";
import {
    baseSettings,
    Box,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    FillBox,
    IIOContext,
    IKeyEventListener,
    IMenuViewProps,
    InstantCloseTransition,
    InstantOpenTransition,
    ITextField,
    IViewStackItem,
    Loader,
    Menu,
    MenuSearch,
    MenuView,
    searchAction,
    SearchMenu,
} from "@launchmenu/core";
import {v4 as uuid} from "uuid";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const subitems = [
    createStandardMenuItem({
        name: "Potaters",
        onExecute: () => alert("Potaters"),
    }),
    createStandardMenuItem({
        name: "Orange",
        onExecute: () => alert("Orange"),
    }),
];

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye!"),
        actionBindings: [
            searchAction.createBinding({
                ID: uuid(),
                async search(query) {
                    // Add a random delay of 1s, simulating some data fetch
                    await new Promise(res => setTimeout(res, 2000));

                    // Return the sub searchables if the query contains "r"
                    return query.search.includes("r")
                        ? {children: searchAction.get(subitems)}
                        : {};
                },
            }),
        ],
    }),
];

const LoadingMenuView: FC<IMenuViewProps> = ({
    menu,
    onExecute,
    containerProps,
    ...rest
}) => (
    <Box display="flex" flexDirection="column" {...containerProps}>
        <MenuView
            containerProps={{flexGrow: 1, flexShrink: 1, position: "relative"}}
            menu={menu}
            onExecute={onExecute}
            {...rest}
        />
        <Box display="flex" justifyContent="center">
            <Loader>
                {h => {
                    menu.getItems(h);
                    // Never actually display any data, just capture the loading state
                    return undefined;
                }}
            </Loader>
        </Box>
    </Box>
);

export class LoadingMenuSearch extends MenuSearch {
    /** @override */
    protected getMenuView(menu: SearchMenu): IViewStackItem {
        return {
            transitions: {
                Open: InstantOpenTransition,
                Close: InstantCloseTransition,
            },
            view: <LoadingMenuView menu={menu} onExecute={this.data.onExecute} />,
        };
    }

    // The normal MenuSearch is meant as a sub-layer, so doesn't handle its own layer closing.
    // This handler augmentation allows for layer closing when the search is empty and esc is pressed
    /** @override */
    protected getFieldHandler(field: ITextField, context: IIOContext): IKeyEventListener {
        const handler = super.getFieldHandler(field, context);
        const back = context.settings.get(baseSettings).controls.common.back;

        return async event => {
            if (back.get().matches(event) && this.fieldData.get()?.field?.get() == "") {
                this.closers.forEach(close => close());
                return true;
            }
            return handler(event);
        };
    }
}

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {
            children: searchAction.get(items),
        };
    },
    open({context, onClose}) {
        const menu = new Menu(context, items);
        const searchMenu = new LoadingMenuSearch({
            menu,
            // THe content to show when no search is entered
            defaultMenu: {
                ID: uuid(),
                menuView: (
                    <FillBox padding="small" background="bgTertiary">
                        Please enter a query
                    </FillBox>
                ),
            },
        });

        context.open(searchMenu, {onClose});
    },
});
