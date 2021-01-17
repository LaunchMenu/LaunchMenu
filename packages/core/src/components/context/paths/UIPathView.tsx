import {useDataHook} from "model-react";
import React, {useMemo} from "react";
import {getContextTopLayer} from "../../../context/uiExtracters/getContextTopLayer";
import {IIOContext} from "../../../context/_types/IIOContext";
import {Box} from "../../../styling/box/Box";
import {useHorizontalScroll} from "../../../utils/hooks/useHorizontalScroll";
import {LFC} from "../../../_types/LFC";
import {Transition} from "../stacks/transitions/Transition";
import {Breadcrumbs} from "./Breadcrumbs";

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

    const crumbs = useMemo(
        () => (
            <UIPathViewCrumbs
                context={context}
                pathTransitionDuration={pathTransitionDuration}
            />
        ),
        [context]
    );
    return (
        <Box
            position="relative"
            background="bgTertiary"
            css={{transition: `height ${heightTransitionDuration}ms`}}
            height={path.length > 0 || top?.pathView ? 35 : 0}>
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
    const pathData = path.map(({name}) => name);

    const mouseScrollRef = useHorizontalScroll();
    const leftNegativeMargin = 20;
    return (
        <Box
            background="bgTertiary"
            color="fontBgPrimary"
            padding="small"
            paddingLeft="none"
            whiteSpace="nowrap"
            height="100%"
            overflowX="auto"
            overflowY="hidden"
            boxSizing="border-box"
            display="flex"
            flexDirection="row-reverse"
            maxWidth={`calc(100% + ${leftNegativeMargin}px)`}
            width="fit-content"
            css={{
                marginLeft: -leftNegativeMargin,
                "&::-webkit-scrollbar": {
                    display: "none",
                },
            }}
            elRef={mouseScrollRef}>
            {/* This container undoes the item reversal, while still keeping contents right aligned (regarding overflow) */}
            <Box>
                <Breadcrumbs
                    path={pathData}
                    transitionDuration={pathTransitionDuration}
                />
                <Box marginRight="extraLarge" display="inline-block" />
            </Box>
        </Box>
    );
};
