import React, {useRef} from "react";
import {getLCS} from "../../../utils/getLCS";
import {LFC} from "../../../_types/LFC";
import {v4 as uuid} from "uuid";
import {Box} from "../../../styling/box/Box";
import {AnimateWidth} from "./AnimateWidth";

/**
 * A view to visualize the path of opened UI in the context
 */
export const Breadcumbs: LFC<{path: string[]; transitionDuration?: number}> = ({
    path,
    transitionDuration,
}) => {
    const pathNodes = useRef([] as {name: string; id: string; opened: boolean}[]);
    const oldNodes = pathNodes.current;

    // Obtain all similarities between the old and the new
    const remained = getLCS(oldNodes, path, ({name: a, opened}, b) => a == b && opened);

    // Obtain the new nodes (which never removes old nodes, only closes them)
    const newNodes = [] as {name: string; id: string; opened: boolean}[];
    let prev = [0, 0] as [number, number];
    const updateRange = (
        [prevI1, prevI2]: [number, number],
        [i1, i2]: [number, number]
    ) => {
        // Add all old items in between as closed
        for (let i = prevI1; i < i1; i++) newNodes.push({...oldNodes[i], opened: false});

        // Add all newly added items in between
        for (let i = prevI2; i < i2; i++)
            newNodes.push({name: path[i], id: uuid(), opened: true});
    };
    remained.forEach(([i1, i2]) => {
        updateRange(prev, [i1, i2]);
        prev = [i1 + 1, i2 + 1];
        // Add the item that was unchanged
        newNodes.push(oldNodes[i1]);
    });
    updateRange(prev, [oldNodes.length, path.length]);
    pathNodes.current = newNodes;

    // Render the items
    return (
        <>
            {newNodes.map(({name, id, opened}, i) => {
                return (
                    <AnimateWidth
                        key={id}
                        duration={transitionDuration}
                        width={opened ? "auto" : 0}
                        initialWidth={0}
                        containerProps={{
                            onTransitionEnd: !opened
                                ? () => {
                                      pathNodes.current = pathNodes.current.filter(
                                          ({id: idc}) => idc != id
                                      );
                                  }
                                : undefined,
                        }}>
                        <Box display="inline-block" marginLeft="extraSmall">
                            {name}
                        </Box>
                    </AnimateWidth>
                );
            })}
        </>
    );
};
