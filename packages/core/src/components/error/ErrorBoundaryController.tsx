import {Field, IDataHook} from "model-react";
import React, {createContext, ErrorInfo, FC} from "react";
import {IErrorBoundaryErrorData} from "./_types/IErrorBoundaryErrorData";
import {IErrorComp} from "./_types/IErrorComp";
import {IGetErrorComp} from "./_types/IGetErrorComp";

/**
 * A controller that provides an error boundary context provider that can be added to the component tree in order to control errors in the tree.
 * Allows error messages to be augmented or replaced, as well as errors boundaries being reloaded.
 */
export class ErrorBoundaryController {
    protected errorData = new Field<IErrorBoundaryErrorData[]>([]);

    /**
     * Creates a new error boundary controller
     * @param getErrorComp The function to compute the error to render in the boundary
     */
    public constructor(getErrorComp?: IGetErrorComp) {
        this.getErrorComp = getErrorComp ?? (comp => comp);
    }

    public getErrorComp: IGetErrorComp;
    public Provider: FC = ({children}) => (
        <ErrorBoundariesContext.Provider value={this}>
            {children}
        </ErrorBoundariesContext.Provider>
    );

    /**
     * Registers an error that occurred
     * @param error The error that was thrown
     * @param reload A function to reload the error boundary that caught the error
     * @param errorInfo Extra react information about the error
     * @returns A function that can be used to notify the error having been removed
     */
    public registerError(
        error: any,
        reload: () => void,
        errorInfo: ErrorInfo
    ): () => void {
        const errorData = {error, reload, errorInfo};
        this.errorData.set([...this.errorData.get(), errorData]);
        return () => {
            const currentList = this.errorData.get();
            const index = currentList.indexOf(errorData);
            if (index != -1)
                this.errorData.set([
                    ...currentList.slice(0, index),
                    ...currentList.slice(index + 1),
                ]);
        };
    }

    /**
     * Reloads all the error boundaries
     */
    public reloadBoundaries(): void {
        this.errorData.get().forEach(({reload}) => reload());
    }

    /**
     * Returns the current error data
     * @param hook The data hook to subscribe to changes
     * @returns The error data
     */
    public getErrorData(hook?: IDataHook): IErrorBoundaryErrorData[] {
        return [...this.errorData.get(hook)];
    }
}

export const ErrorBoundariesContext = createContext(new ErrorBoundaryController());
