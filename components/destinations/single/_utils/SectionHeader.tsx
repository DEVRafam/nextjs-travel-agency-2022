// Tools
import { styled } from "@mui/system";
// Types
import type { FunctionComponent } from "react";
// Material UI Components
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// Other components
import Link from "next/link";
import UnfadeOnScroll from "@/components/_utils/UnfadeOnScroll";
// Styled Components
import BackgroundHeader from "@/components/_utils/styled/BackgroundHeader";
import ButtonWithLineTransition from "@/components/_utils/styled/ButtonWithLineTransition";
const Header = styled(Typography)(({ theme }) => ({
    fontWeight: 900,
    userSelect: "none",
    position: "relative",
    "span.normal": {
        position: "relative",
        zIndex: 1,
        letterSpacing: "-2px",
        textTransform: "uppercase", //
    },
}));
const Wrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    margin: "200px 0 100px 0",
}));
const ContinueButton = styled(ButtonWithLineTransition)(({ theme }) => ({
    padding: "10x 0",
    minWidth: "200px",
    fontSize: "1.1rem",
}));

interface SectionHeaderProps {
    header: string;
    buttonMsg?: string;
    biggerHeader?: string;
    onClick?: () => void;
    url?: string;
}
const SectionHeader: FunctionComponent<SectionHeaderProps> = (props) => {
    return (
        <UnfadeOnScroll duration={700}>
            <Wrapper>
                <Header variant="h2">
                    <span className="normal">{props.header}</span>
                    {(() => {
                        if (props.biggerHeader) {
                            return <BackgroundHeader>{props.biggerHeader}</BackgroundHeader>;
                        }
                    })()}
                </Header>
                {(() => {
                    if (props.buttonMsg && props.url) {
                        return (
                            <ContinueButton reverse line="right">
                                <Link href={props.url} passHref>
                                    {props.buttonMsg}
                                </Link>
                            </ContinueButton>
                        );
                    } else if (props.buttonMsg && props.onClick) {
                        return (
                            <ContinueButton reverse line="right">
                                {props.buttonMsg}
                            </ContinueButton>
                        );
                    }
                })()}
            </Wrapper>
        </UnfadeOnScroll>
    );
};

export default SectionHeader;
