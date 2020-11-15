import React, {useMemo, useRef} from "react";
import {getContextTopLayer} from "../../../context/uiExtracters/getContextTopLayer";
import {IIOContext} from "../../../context/_types/IIOContext";
import {Box} from "../../../styling/box/Box";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {LFC} from "../../../_types/LFC";
import {Transition} from "../stacks/transitions/Transition";
import {Breadcumbs} from "./Breadcrumbs";

/**
 * A view to visualize the path of opened UI in the context
 */
export const UIPathView: LFC<{
    context: IIOContext;
    heightTransitionDuration?: number;
    pathTransitionDuration?: number;
}> = ({context, heightTransitionDuration, pathTransitionDuration}) => {
    const [h] = useDataHook();
    const top = getContextTopLayer(context, h);
    const path = top?.getPath(h) ?? [];

    const crumbs = useMemo(() => <UIPathViewCrumbs context={context} />, [context]);
    return (
        <Box
            position="relative"
            css={{transition: `height ${heightTransitionDuration}ms`}}
            height={path.length > 0 || top?.pathView ? 30 : 0}>
            <Transition>{top?.pathView ? top?.pathView : crumbs}</Transition>
        </Box>
    );
};

const UIPathViewCrumbs: LFC<{context: IIOContext; pathTransitionDuration?: number}> = ({
    context,
    pathTransitionDuration,
}) => {
    const [h] = useDataHook();
    const top = getContextTopLayer(context, h);
    const path = top?.getPath(h) ?? [];

    const pathData = path.reduce(
        (cur, {name}) => (cur.length == 0 ? [name] : [...cur, ">", name]),
        []
    );
    return (
        <Box
            background="bgTertiary"
            color="primary"
            padding="small"
            height="100%"
            boxSizing="border-box">
            <Breadcumbs path={pathData} transitionDuration={pathTransitionDuration} />
        </Box>
    );
};
