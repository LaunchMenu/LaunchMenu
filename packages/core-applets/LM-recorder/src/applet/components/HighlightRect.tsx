import {Box, FillBox, standardWindowSize, useTheme, wait} from "@launchmenu/core";
import {Field, Loader} from "model-react";
import React, {FC, Fragment, useMemo} from "react";
import {Controller} from "../controller/Controller";
import Color from "color";
import {
    IHighlightArea,
    IHighlightAreaNames,
    IHighlightRectProps,
} from "./_types/IHighlightRectProps";
import {IRect} from "../overlays/window/_types/IRect";
import {Visualizer} from "../overlays/Visualizer";
import {IShowConfig} from "../overlays/_types/IShowConfig";
import {FadeTransition} from "./FadeTransition";
import {PointerOverlay} from "./PointerOverlay";
import {IDirection} from "./_types/IPointerOverlayProps";

/** A component used to highlight a region of the screen */
export const HighlightRect: FC<IHighlightRectProps> = ({
    area,
    visible = ["textField", "menu", "content"],
    transitionDuration = 300,
    comment,
    commentSide = "right",
    commentProps,
}) => {
    const {direction, maxWidth, ...rect} =
        typeof area == "string"
            ? getArea(area, visible)
            : {...area, maxWidth: undefined, direction: oppositeDirs[commentSide]};
    const theme = useTheme();
    const shadowColor = useMemo(
        () => new Color(theme.color.primary).alpha(0.5).toString(),
        [theme.color.primary]
    );
    return (
        <FillBox
            zIndex={0}
            css={{
                ">*": {
                    transition: `width ${transitionDuration}ms, height ${transitionDuration}ms, left ${transitionDuration}ms, top ${transitionDuration}ms`,
                },
            }}>
            <FillBox
                zIndex={1}
                border="normal"
                borderColor="primary"
                boxSizing="border-box"
                css={{
                    ...rect,
                    left: rect.x,
                    top: rect.y,
                    boxShadow: `inset 0px 0px 5px 0px ${shadowColor}`,
                }}
            />
            <HighlightOverlay x1={rect.x} y1={rect.y + rect.height} />
            <HighlightOverlay x1={rect.x + rect.width} y2={rect.y + rect.height} />
            <HighlightOverlay x2={rect.x + rect.width} y2={rect.y} />
            <HighlightOverlay x2={rect.x} y1={rect.y} />
            <FadeTransition
                containerProps={{position: "relative", zIndex: 2}}
                duration={transitionDuration}
                deps={[comment]}>
                {comment ? (
                    <PointerOverlay
                        zIndex={2}
                        maxWidth={maxWidth ? maxWidth - 40 : maxWidth}
                        pointAt={{...rect, direction}}
                        {...commentProps}>
                        {comment}
                    </PointerOverlay>
                ) : (
                    <Fragment />
                )}
            </FadeTransition>
        </FillBox>
    );
};

const oppositeDirs = {
    left: "right",
    right: "left",
    up: "down",
    down: "up",
} as const;
const fullMargin = 10; // The spacing around the window when the rectangle is full screen

/** TODO: find a less hardcoded way of doing this */
const sp = 18; // Standard padding
const {width: ww, height: wh} = standardWindowSize;
const sh = 60; // Search height
const mw = 0.4; // Menu width (fraction)
const ph = 35; // Path height
const getArea = (
    area: IHighlightAreaNames,
    visible: IHighlightAreaNames[]
): IRect & {
    direction: IDirection;
    maxWidth: number;
} => {
    const width = ww - sp * 2,
        height = wh - sp * 2;
    let x = 0,
        y = 0,
        x2 = width,
        y2 = height;

    if (visible.includes("textField") && area != "textField") y += sh;
    if (visible.includes("path") && ["content", "menu"].includes(area)) y += ph;
    if (visible.includes("content") && area == "menu") x2 = Math.round(width * mw);
    if (visible.includes("menu") && area == "content") x = Math.round(width * mw);

    if (area == "textField") y2 = y + sh;
    if (area == "path") y2 = y + ph;

    let direction: IDirection = "up";
    if (area == "menu") direction = visible.includes("content") ? "left" : "down";
    if (area == "content") direction = visible.includes("menu") ? "right" : "down";

    const maxWidth = width * (area == "menu" ? 1 - mw : area == "content" ? mw : 1);

    return {x: sp + x, y: sp + y, width: x2 - x, height: y2 - y, direction, maxWidth};
};

const HighlightOverlay: FC<{x1?: number; x2?: number; y1?: number; y2?: number}> = ({
    x1,
    x2,
    y1,
    y2,
}) => (
    <FillBox
        css={{
            backdropFilter: `blur(3px)`,
            left: x1 ?? -fullMargin,
            top: y1 ?? -fullMargin,
            width: fullMargin + (x2 != undefined ? x2 : x1 != undefined ? ww - x1 : 0),
            height: fullMargin + (y2 != undefined ? y2 : y1 != undefined ? wh - y1 : 0),
            bottom: "auto",
            right: "auto",
        }}>
        <FillBox opacity={0.8} background="bgPrimary" />
    </FillBox>
);

/**
 * Shows the highlight rectangle for a given rectangle
 * @param visualizer The visualizer to show the rectangle in
 * @param config The configuration of the rectangle to show
 * @returns The controller to remove the rectangle or update it
 */
export async function showHighlightRect(
    visualizer: Visualizer,
    {
        area,
        visible,
        duration,
        transitionDuration = 300,
        fadeIn = false,
        fadeOut = false,
        ...rest
    }: IShowConfig & IHighlightRectProps
): Promise<{
    /** Remove the rectangle */
    destroy: () => Promise<void>;
    /** Updates the rectangle's props */
    update: (props: IHighlightRectProps) => void;
}> {
    // Create the element
    const props = new Field<Omit<IHighlightRectProps, "area"> & {area?: IHighlightArea}>(
        rest
    );

    let screenEl = null as null | HTMLElement;
    let init = false;
    const screenRef = (el: null | HTMLElement) => {
        if (!init && el) {
            const {width, height} = el.getBoundingClientRect();
            props.set({
                ...props.get(),
                area: {
                    x: -fullMargin,
                    y: -fullMargin,
                    width: width + 2 * fullMargin,
                    height: height + 2 * fullMargin,
                },
            });
            setTimeout(() => {
                el.getBoundingClientRect(); // Force reflow
                props.set({...props.get(), area});
            }, 10);
        }
        screenEl = el;
    };

    const element = (
        <FillBox elRef={screenRef}>
            <Loader>
                {h => {
                    const {area, ...restProps} = props.get(h);
                    if (!area) return <Fragment />;
                    return (
                        <HighlightRect
                            visible={visible}
                            transitionDuration={transitionDuration}
                            area={area}
                            {...restProps}
                        />
                    );
                }}
            </Loader>
        </FillBox>
    );

    // Open the element
    const {destroy: orDestroy} = await visualizer.show(element, {fadeIn, fadeOut});

    // Create controllers for the element
    const destroy = () => {
        const {width, height} = screenEl?.getBoundingClientRect() ?? {
            width: Infinity,
            height: Infinity,
        };
        props.set({
            ...props.get(),
            area: {
                x: -fullMargin,
                y: -fullMargin,
                width: width + 2 * fullMargin,
                height: height + 2 * fullMargin,
            },
            comment: undefined,
        });

        return new Promise<void>(res => {
            setTimeout(() => {
                orDestroy();
                res();
            }, transitionDuration);
        });
    };
    const update = (newProps: IHighlightRectProps) => props.set(newProps);

    // Possibly schedule element removal
    if (duration) {
        await wait(duration);
        destroy();
    }

    // Return the function to update the element with
    return {
        update,
        destroy,
    };
}
