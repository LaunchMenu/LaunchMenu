import React, {ReactNode} from "react";
import {LFC} from "../../_types/LFC";
import {IDataHook, Loader as MRLoader} from "model-react";
import {Spinner} from "./Spinner";
import {ErrorRenderer} from "./ErrorRenderer";
import {CenterBox} from "../CenterBox";

/** A model-react loader with standard spinner and error renderer */
export const CenteredLoader: LFC<{
    /** An alias for content */
    children?: (hook: IDataHook) => ReactNode;
    /** The content to show when there are no exceptions and data loaded */
    content?: (hook: IDataHook) => ReactNode;
    /** The time such that if data is older, it will be refreshed */
    forceRefreshTime?: number;
    /** The number of milliseconds to debounce updates, -1 to forward changes synchronously, defaults to 0 */
    debounce?: number;
}> = props => (
    <MRLoader
        onLoad={
            <CenterBox>
                <Spinner />
            </CenterBox>
        }
        onError={errors => (
            <CenterBox>
                {errors.map((error, i) => (
                    <ErrorRenderer key={i} error={error} />
                ))}
            </CenterBox>
        )}
        {...props}
    />
);
