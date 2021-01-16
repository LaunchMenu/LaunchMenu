import {IDataHook} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import {UILayer} from "../../uiLayers/standardUILayer/UILayer";
import {IUILayerContentData} from "../../uiLayers/_types/IUILayerContentData";
import {baseSettings} from "../settings/baseSettings/baseSettings";
import {v4 as uuid} from "uuid";
import {IStandardUILayerData} from "../../uiLayers/standardUILayer/_types/IStandardUILayerData";
import {IUILayerBaseConfig} from "../../uiLayers/_types/IUILayerBaseConfig";
import {HomeContentVisibility} from "../settings/baseSettings/general/content/_types/HomeContentVisibility";

/**
 * The standard UILayer for the LM session including the home content depending on settings
 */
export class LMSessionLayer extends UILayer {
    protected contentID = uuid();

    /**
     * Creates a new standard UILayer
     * @param data The data to create the layer from
     * @param config Base ui layer configuration
     */
    public constructor(
        data: IStandardUILayerData[] | IStandardUILayerData,
        config?: IUILayerBaseConfig
    ) {
        super(data, {showNodataOverlay: false, ...config});
    }

    /** @override */
    protected initialize(
        context: IIOContext,
        close: () => void
    ): void | (() => Promise<void>) {
        return super.initialize(context, close);
    }

    /** @override */
    public getContentData(hook?: IDataHook): IUILayerContentData[] {
        const context = this.context.get(hook);
        const settings = context?.settings.get(baseSettings).content.homeContent;
        const homeView = settings?.content.get(hook).content;
        const showView =
            homeView && settings?.visibility.get(hook) == HomeContentVisibility.inContent;
        return [
            {
                ID: this.contentID + showView,
                contentView: showView ? homeView : {close: true},
            },
            ...super.getContentData(hook),
        ];
    }
}
