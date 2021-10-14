import React from "react";
import {
    AbstractUILayer,
    baseSettings,
    Box,
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    handleDeselectInput,
    handleExecuteInput,
    IDisposableKeyEventListener,
    IIOContext,
    IMenu,
    IUILayerBaseConfig,
    IUILayerMenuData,
    KeyEvent,
    KeyPattern,
    Loader,
    Menu,
    MenuView,
    setupContextMenuHandler,
    setupItemKeyListenerHandler,
} from "@launchmenu/core";
import {Field, IDataHook, IDataRetriever} from "model-react";
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
            children: {
                launch: createKeyPatternSetting({
                    name: "Launch",
                    init: new KeyPattern("space"),
                }),
            },
        }),
});

const items = new Array(30).fill(0).map((_, i) =>
    createStandardMenuItem({
        name: `Item ${i}`,
        onExecute: () => alert(`Activated ${i}`),
    })
);

class GambleLayer extends AbstractUILayer {
    protected menu: IMenu;
    protected data = new Field([] as IUILayerMenuData[]);
    protected charge = {
        chargeSpeed: 0.05,
        minCharge: 0.3,
        decay: 0.03,
        speed: 1,
    };

    /**
     * Creates a new menu gambling layer
     * @param menu The menu that the layer is for
     * @param config The base layer config
     */
    public constructor(menu: IMenu, config: IUILayerBaseConfig) {
        super(config);
        this.menu = menu;
    }

    /** @override */
    protected initialize(context: IIOContext, close: () => void): () => void {
        const handler = this.getMenuHandler(this.menu, close);
        const view = this.getMenuUI(this.menu, handler.getCharge);
        this.data.set([
            {
                ID: uuid(),
                menu: this.menu,
                menuView: view,
                menuHandler: handler.handler,
            },
        ]);

        return () => handler.destroy();
    }

    /**
     * Creates the UI for the given menu
     * @param menu The menu to visualize
     * @param getCharge The function to retrieve the current charge
     * @returns The view element
     */
    protected getMenuUI(menu: IMenu, getCharge: IDataRetriever<number>): JSX.Element {
        return (
            <Box display="flex" flexDirection="column" height="100%">
                <Loader>
                    {h => (
                        <Box
                            height={10}
                            width={`${Math.round(10 + getCharge(h) * 90)}%`}
                            css={{backgroundColor: "red"}}
                        />
                    )}
                </Loader>
                <Box flexGrow={1} position="relative">
                    <MenuView menu={menu} />
                </Box>
            </Box>
        );
    }

    /**
     * Retrieves the key handler for a menu
     * @param menu The menu to create the handler for
     * @param onExit The function to execute when receiving an exit command
     * @returns The key listener
     */
    protected getMenuHandler(
        menu: IMenu,
        onExit: () => void
    ): {getCharge: IDataRetriever<number>} & IDisposableKeyEventListener {
        const context = menu.getContext();
        const controls = context.settings.get(baseSettings).controls;
        const launchKey = context.settings.get(settings).launch;
        const fieldSettings = controls.menu;
        const launcher = this.setupLauncher(() => {
            const items = menu.getItems();
            const cursor = menu.getCursor();
            const index = cursor ? (items.indexOf(cursor) + 1) % items.length : 0;
            if (items.length > 0) menu.setCursor(items[index]);
        });

        // Setup handlers
        let {
            handler: handleItemKeyListeners,
            destroy: destroyItemListenersHandler,
        } = setupItemKeyListenerHandler(menu);
        const {
            handler: handleContextMenu,
            destroy: destroyContextMenuHandler,
        } = setupContextMenuHandler(menu, {
            useContextItemKeyHandlers: true,
            pattern: () => fieldSettings.openContextMenu.get(),
        });

        // Return the listener
        return {
            handler: async (e: KeyEvent) => {
                if (await handleItemKeyListeners?.(e)) return true;
                if (await handleContextMenu(e)) return true;
                if (handleExecuteInput(e, menu, undefined, fieldSettings.execute.get()))
                    return true;
                if (launchKey.get().matches(e)) {
                    launcher.fire();
                    return true;
                }

                const back = controls.common.back.get();
                if (handleDeselectInput(e, menu, back)) return true;
                if (onExit && back.matches(e)) {
                    onExit();
                    return true;
                }
            },
            destroy: () => {
                destroyItemListenersHandler?.();
                destroyContextMenuHandler();
                launcher.destroy();
            },
            getCharge: launcher.getCharge,
        };
    }

    /**
     * Creates the launcher function
     * @param selectNext The function to call to select the next item in the menu
     * @returns The data to manage the launcher
     */
    protected setupLauncher(
        selectNext: () => void
    ): {getCharge: IDataRetriever<number>; destroy: () => void; fire: () => void} {
        const charge = new Field(0);

        let up = true;
        const chargeIntervalID = setInterval(() => {
            let value = Math.max(
                0,
                Math.min(charge.get() + (up ? 1 : -1) * this.charge.chargeSpeed, 1)
            );
            charge.set(value);
            if (value == 0 || value == 1) up = !up;
        }, 50);

        return {
            getCharge: h => charge.get(h),
            destroy: () => {
                clearInterval(chargeIntervalID);
            },
            fire: () => {
                let speed = charge.get() + this.charge.minCharge;
                let pos = 0;
                const intervalID = setInterval(() => {
                    speed = Math.max(0, speed - this.charge.decay);
                    pos += this.charge.speed * speed;
                    while (pos > 1) {
                        pos--;
                        selectNext();
                    }
                    if (speed == 0) clearInterval(intervalID);
                }, 50);
            },
        };
    }

    /** @override */
    public getMenuData(
        hook?: IDataHook,
        extendData: IUILayerMenuData[] = []
    ): IUILayerMenuData[] {
        return super.getMenuData(hook, [...this.data.get(hook), ...extendData]);
    }
}

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(
            new GambleLayer(new Menu(context, items), {
                path: "Example",
            }),
            {onClose}
        );
    },
});
