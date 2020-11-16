import React from "react";
import {FillBox} from "../components/FillBox";
import {IViewStackItem} from "./_types/IViewStackItem";

/**
 * A view to use in UILayers when no data is specified for a given section
 */
export const UIMissingView: IViewStackItem = {
    transparent: true,
    view: <FillBox backgroundColor="bgTertiary" opacity={0.5} />,
};
