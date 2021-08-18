import {ErrorInfo} from "react";

export type IErrorBoundaryErrorData = {
    error: any;
    reload: () => void;
    errorInfo: ErrorInfo;
};
