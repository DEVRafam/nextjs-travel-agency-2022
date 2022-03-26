import type { ReactNode } from "react";

export type Direction = "left" | "right" | "top" | "bottom";

export interface ButtonWrapperParams {
    primary?: true;
    reverse?: true;
    color?: string;
    background?: string;
    line?: Direction;
}

export interface ButtonWithLineTransitionProps extends ButtonWrapperParams {
    children: ReactNode;
}

export interface ButtonWrapperParams {
    primary?: true;
    reverse?: true;
    color?: string;
    background?: string;
    line?: Direction;
}
