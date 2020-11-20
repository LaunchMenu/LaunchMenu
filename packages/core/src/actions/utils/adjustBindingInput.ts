import {IDataHook} from "model-react";
import {IBindingCreatorConfig} from "../_types/IBindingCreator";

/**
 * Modifies some given binding input data
 * @param config The input data to be modified
 * @param modify The modification function
 * @returns The modified data
 */
export function adjustBindingInput<I, O>(
    config: I | IBindingCreatorConfig<I>,
    modify: (input: I) => O
): O | IBindingCreatorConfig<O> {
    if (typeof config == "object" && ("data" in config || "subscribableData" in config)) {
        if ("subscribableData" in config)
            return {
                ...config,
                subscribableData: (h: IDataHook) => modify(config.subscribableData(h)),
            };
        else return {...config, data: modify(config.data)};
    }
    return modify(config);
}
