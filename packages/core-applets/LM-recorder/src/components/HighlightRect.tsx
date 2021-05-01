import {Box, FillBox, standardWindowSize, useTheme, wait} from "@launchmenu/core";
import {Field, Loader} from "model-react";
import React, {FC, useMemo} from "react";
import {Controller} from "../controller/Controller";
import {IShowConfig} from "../controller/recording/_types/IShowConfig";
import {IRect} from "../overlays/window/_types/IRect";
import Color from "color";
import {
    IHighlightArea,
    IHighlightAreaNames,
    IHighlightRectProps,
} from "./_types/IHighlightRectProps";

/** A component used to highlight a region of the screen */
export const HighlightRect: FC<IHighlightRectProps> = ({
    area,
    visible = ["textField", "menu", "content"],
    transitionDuration = 200,
}) => {
    const rect = typeof area == "string" ? getArea(area, visible) : area;
    const theme = useTheme();
    const shadowColor = useMemo(
        () => new Color(theme.color.primary).alpha(0.5).toString(),
        [theme.color.primary]
    );
    return (
        <FillBox
            zIndex={1}
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
        </FillBox>
    );
};

/** TODO: find a less hardcoded way of doing this */
const sp = 18; // Standard padding
const {width: ww, height: wh} = standardWindowSize;
const sh = 60; // Search height
const mw = 0.4; // Menu width (fraction)
const ph = 35; // Path height
const getArea = (area: IHighlightAreaNames, visible: IHighlightAreaNames[]): IRect => {
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

    return {x: sp + x, y: sp + y, width: x2 - x, height: y2 - y};
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
            left: x1,
            top: y1,
            height: y2 ?? (y1 != undefined ? wh - y1 : "auto"),
            width: x2 ?? (x1 != undefined ? ww - x1 : "auto"),
            bottom: "auto",
            right: "auto",
        }}>
        <FillBox opacity={0.8} background="bgPrimary" />
    </FillBox>
);

/**
 * Shows the highlight rectangle for a given rectangle
 * @param controller The controller to show the rectangle in
 * @param config The configuration of the rectangle to show
 * @returns The controller to remove the rectangle or update it
 */
export async function showHighlightRect(
    controller: Controller,
    {
        area,
        visible,
        duration,
        transitionDuration = 200,
        fadeIn = false,
        fadeOut = false,
    }: IShowConfig & IHighlightRectProps
): Promise<{
    /** Remove the rectangle */
    destroy: () => Promise<void>;
    /** Update the rectangle to be shown */
    update: (area: IHighlightArea) => void;
}> {
    // Create the element
    const areaField = new Field<IHighlightArea>({
        x: 0,
        y: 0,
        width: Infinity,
        height: Infinity,
    });

    let screenEl = null as null | HTMLElement;
    let init = false;
    const screenRef = (el: null | HTMLElement) => {
        if (!init && el) {
            const {width, height} = el.getBoundingClientRect();
            areaField.set({x: 0, y: 0, width, height});
            setTimeout(() => {
                el.getBoundingClientRect(); // Force reflow
                areaField.set(area);
            }, 10);
        }
        screenEl = el;
    };

    const element = (
        <FillBox elRef={screenRef}>
            <Loader>
                {h => (
                    <HighlightRect
                        area={areaField.get(h)}
                        visible={visible}
                        transitionDuration={transitionDuration}
                    />
                )}
            </Loader>
        </FillBox>
    );

    // Open the element
    const {destroy: orDestroy} = await controller.show(element, {fadeIn, fadeOut});

    // Create controllers for the element
    const destroy = () => {
        const {width, height} = screenEl?.getBoundingClientRect() ?? {
            width: Infinity,
            height: Infinity,
        };
        areaField.set({x: 0, y: 0, width, height});

        return new Promise<void>(res => {
            setTimeout(() => {
                orDestroy();
                res();
            }, transitionDuration);
        });
    };
    const update = (area: IRect) => areaField.set(area);

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
