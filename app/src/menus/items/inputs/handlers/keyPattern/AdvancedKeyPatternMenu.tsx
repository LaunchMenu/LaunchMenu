import React from "react";
import {KeyPattern} from "./KeyPattern";
import {IAdvancedKeyPatternMenuData} from "./_types/IAdvancedKeyPatternMenuData";
import {Field} from "model-react";
import {createKeyPatternOptionMenuItem} from "./keyPatternOptionMenuItem/createKeyPatternOptionMenuItem";
import {updateKeyPatternOptionExecuteHandler} from "./keyPatternOptionMenuItem/actionHandlers/updateKeyPatternOptionExecuteHandler";
import {AdvancedKeyPatternContent} from "./AdvancedKeyPatternContent";
import {IField} from "../../../../../_types/IField";
import {Menu} from "../../../../menu/Menu";
import {Observer} from "../../../../../utils/modelReact/Observer";
import {IIOContext} from "../../../../../context/_types/IIOContext";
import {openUI} from "../../../../../context/openUI/openUI";
import {createStandardMenuItem} from "../../../createStandardMenuItem";
import {createFinishMenuItem} from "../../../createFinishMenuItem";
import {getCategoryAction} from "../../../../actions/types/category/getCategoryAction";
import {controlsCategory} from "../../../../categories/types/controlsCategory";
import {IMenuItem} from "../../../_types/IMenuItem";

/**
 * A menu that can update a key pattern
 */
export class AdvancedKeyPatternMenu extends Menu {
    protected closeContent: () => void;

    protected config: IAdvancedKeyPatternMenuData;
    protected field: IField<KeyPattern>;
    protected fieldObserver: Observer<KeyPattern>;

    /**
     * Creates a new advanced key pattern edit menu
     * @param context The context to be used by menu items
     * @param config All data for the menu
     */
    public constructor(context: IIOContext, config: IAdvancedKeyPatternMenuData) {
        super(context);
        this.config = config;

        if (config.liveUpdate) {
            this.field = config.field;
        } else {
            this.field = new Field(config.field.get(null));
        }

        this.setupMenu();
        this.openContent();
    }

    /**
     * Opens the summary of the key pattern
     */
    protected openContent(): void {
        this.closeContent = openUI(this.context, {
            content: <AdvancedKeyPatternContent pattern={h => this.field.get(h)} />,
        });
    }

    /**
     * Adds all items to the menu
     */
    protected setupMenu(): void {
        this.addItems([
            createStandardMenuItem({
                name: "Add pattern",
                actionBindings: [
                    updateKeyPatternOptionExecuteHandler.createBinding({
                        patternField: this.field,
                        option: {type: "down", pattern: []},
                        insertIfDeleted: true,
                    }),
                    getCategoryAction.createBinding(controlsCategory),
                ],
            }),
            createFinishMenuItem({
                onExecute: () => this.finish(),
                actionBindings: [getCategoryAction.createBinding(controlsCategory)],
            }),
        ]);
        this.setupPatternItems();
    }

    /**
     * Sets up the listeners to synchronize the patterns with the menu
     */
    protected setupPatternItems(): void {
        let items = [] as IMenuItem[];
        this.fieldObserver = new Observer(this.field).listen(({patterns}) => {
            this.removeItems(items);
            items = patterns.map(option =>
                createKeyPatternOptionMenuItem({
                    patternField: this.field,
                    option,
                })
            );
            this.addItems(items);
        }, true);
    }

    /**
     * Finish the editing and commits the changes
     */
    public finish(): void {
        this.config.onFinish?.(this.field.get(null));
    }

    /** @override */
    public destroy(): boolean {
        if (super.destroy()) {
            this.closeContent();
            return true;
        }
        return false;
    }
}
