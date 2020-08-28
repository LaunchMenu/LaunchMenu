import React from "react";
import {Menu} from "../../../menus/menu/Menu";
import {KeyPattern} from "./KeyPattern";
import {IField} from "../../../_types/IField";
import {IAdvancedKeyPatternMenuData} from "./_types/IAdvancedKeyPatternMenuData";
import {Field} from "model-react";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {createFinishMenuItem} from "../../../menus/items/createFinishMenuItem";
import {Observer} from "../../../utils/modelReact/Observer";
import {createKeyPatternOptionMenuItem} from "./keyPatternOptionMenuItem/createKeyPatternOptionMenuItem";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {updateKeyPatternOptionExecuteHandler} from "./keyPatternOptionMenuItem/actionHandlers/updateKeyPatternOptionExecuteHandler";
import {openUI} from "../../../context/openUI/openUI";
import {AdvancedKeyPatternContent} from "./AdvancedKeyPatternContent";
import {controlsCategory} from "../../../menus/categories/types/controlsCategory";
import {getCategoryAction} from "../../../menus/actions/types/category/getCategoryAction";

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
     * @param config All data for the menu
     */
    public constructor(config: IAdvancedKeyPatternMenuData) {
        super();
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
        this.closeContent = openUI(this.config.context, {
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
                        context: this.config.context,
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
                    context: this.config.context,
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
    public destroy(): void {
        super.destroy();
        this.closeContent();
    }
}
