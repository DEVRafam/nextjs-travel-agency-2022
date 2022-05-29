// Tools
import colorTheme from "@/colorTheme";
import { styled, alpha } from "@mui/system";
import { useRef, useState, forwardRef, useEffect } from "react";
// Types
import type { InputBaseProps } from "@mui/material/InputBase";
import type { Restriction } from "@/@types/Restriction";
import type { ReactNode, ChangeEvent, ForwardRefExoticComponent } from "react";
// Material UI Components
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
// Other components
import LengthNotification from "@/components/_utils/LengthNotification";
// Material UI Icons
import Clear from "@mui/icons-material/Clear";
// Styled components
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    borderColor: theme.palette.text.primary,
    width: "200px",
    background: theme.palette.text.primary,
    paddingLeft: "14px",
    borderRadius: "4px",
    boxSizing: "border-box",
    border: `2px solid  ${theme.palette.text.primary}`,
    transition: "background .2s,border .2s",
    fontSize: colorTheme.typography.subtitle2.fontSize,
    "input,textarea": {
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
    },
    textarea: {
        "&::-webkit-scrollbar": { width: "10px" },
        "&::-webkit-scrollbar-track": { boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)" },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.main,
            borderRadius: "2px",
        },
    },
    "&.Mui-focused": {
        border: `2px solid  ${theme.palette.primary.main}`,
        background: theme.palette.primary.main,
        textarea: {
            "&::-webkit-scrollbar-thumb": {
                borderRadius: "2px",
                backgroundColor: theme.palette.text.primary,
            },
        },
    },
    "&.Mui-disabled": {
        border: `2px solid rgb(130,143,156)`,
        background: alpha(theme.palette.text.primary, 0.5),
        "button,textarea,input": {
            color: theme.palette.text.primary,
            "-webkit-text-fill-color": theme.palette.text.primary,
            fontWeight: 500,
        },
    },
}));

interface StyledInputProps extends InputBaseProps {
    icon?: ReactNode;
    lengthNotification?: {
        fieldName: string;
        restrictions: Restriction;
    };
}

const StyledInput: ForwardRefExoticComponent<StyledInputProps> = forwardRef((props, ref) => {
    const { icon, onChange, lengthNotification, ...propsToForward } = props;

    const inputRef = useRef<HTMLElement>();
    const [debounce, setDebounce] = useState<number | null>(null);
    const [newContent, setNewContent] = useState<string>(props.value as string);

    // Manage received ref property
    useEffect(() => {
        if (ref) (ref as any).current = inputRef.current;
    }, [ref, inputRef]);

    const clearInputValue = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => inputRef.current && inputRef.current.blur(), 1);
        }
        if (props.onChange) {
            props.onChange({ target: { value: "" } } as any);
            setNewContent("");
        }
    };

    const onChangeMiddleware = (e: ChangeEvent<HTMLInputElement>) => {
        if (props.lengthNotification) {
            const { min, max } = props.lengthNotification.restrictions;
            const { length } = e.target.value;

            if (length > max) return;
        }
        setNewContent(e.target.value as string);

        if (debounce) clearTimeout(debounce);
        setDebounce(setTimeout(onBlur, 100) as any);
    };
    const onBlur = () => {
        if (props.onChange) props.onChange({ target: { value: newContent } } as any);
    };

    return (
        <>
            <StyledInputBase
                inputRef={inputRef}
                startAdornment={
                    icon && (
                        <InputAdornment position="start" sx={{ p: 0, opacity: 0.7 }}>
                            {icon}
                        </InputAdornment>
                    )
                }
                endAdornment={
                    !props.multiline && (
                        <InputAdornment position="end" sx={{ p: 0, opacity: 0.7 }}>
                            <IconButton disabled={!!!(propsToForward.value as string).length} onClick={clearInputValue} tabIndex={-1}>
                                <Clear></Clear>
                            </IconButton>
                        </InputAdornment>
                    )
                }
                onChange={onChangeMiddleware}
                onBlur={onBlur}
                // Has to be at the end so as to overwritte every above property!
                {...(propsToForward as any)}
                value={newContent}
            ></StyledInputBase>

            {lengthNotification && (
                <LengthNotification
                    fieldName={lengthNotification.fieldName} //
                    restrictions={lengthNotification.restrictions}
                    text={newContent as string}
                />
            )}
        </>
    );
});
StyledInput.displayName = "StyledInput";

export default StyledInput;
