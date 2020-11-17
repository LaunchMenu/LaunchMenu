import React, {useEffect, useState, FC, useCallback, useRef} from "react";
import {FillBox} from "../../../../FillBox";
import {IFadeCloseTransitionProps} from "./_types/IFadeCloseTransitionProps";

/**
 * A simple fading transition
 */
export const FadeCloseTransition: FC<IFadeCloseTransitionProps> = ({
    onComplete,
    children,
    duration = 150,
    activate = true,
}) => {
    const [started, setStarted] = useState(false);
    const transitionEl = useRef<HTMLElement>();
    useEffect(() => {
        setStarted(activate);
    }, [activate]);
    const _onComplete = useCallback((e: React.TransitionEvent) => {
        if (e.target != transitionEl.current) return;
        onComplete?.();
        e.stopPropagation();
        e.preventDefault();
    }, []);

    return (
        <FillBox
            elRef={transitionEl}
            onTransitionEnd={_onComplete}
            css={{
                transition: started ? `opacity ${duration}ms linear` : "",
                opacity: started ? 0 : 1,
            }}>
            {children}
        </FillBox>
    );
};
