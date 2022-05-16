// Tools
import { styled } from "@mui/system";
import { destinationPictureURL } from "@/utils/client/imageURLs";
// Types
import type { MUIStyledCommonProps } from "@mui/system";
import type { FunctionComponent } from "react";
// Styled Components
import SkeletonImage from "@/components/_utils/styled/SkeletonImage";

const Wrapper = styled("div")(({ theme }) => ({
    height: "280px",
    position: "relative",
    borderRadius: "10px 10px 0 0 ",
    overflow: "hidden",
    width: "100%",
}));

interface BackgroundPictureProps extends MUIStyledCommonProps {
    folder: string;
    city: string;
    country: string;
    resolution: "360p" | "480p" | "720p" | "1080p";
}

const BackgroundPicture: FunctionComponent<BackgroundPictureProps> = (props) => {
    const { folder, resolution, city, country, ...propsToForward } = props;
    return (
        <Wrapper {...propsToForward} className="destination-picture">
            <SkeletonImage
                layout="fill" //
                alt={`${city}-thumbnail`}
                src={destinationPictureURL(folder, resolution, "thumbnail")}
                objectFit="cover"
                modalMaxResolution="1080p"
                advanceModalProperties={{
                    title: city,
                    sectionName: country,
                }}
            ></SkeletonImage>
        </Wrapper>
    );
};

export default BackgroundPicture;
