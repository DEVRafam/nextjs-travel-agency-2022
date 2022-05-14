// Tools
import { styled } from "@mui/system";
import { destinationPictureURL } from "@/utils/client/imageURLs";
// Types
import type { FunctionComponent } from "react";
// Other components
import SkeletonImage from "@/components/_utils/styled/SkeletonImage";
// Styled components
const DestinationPictureWrapper = styled("div")(({ theme }) => ({
    height: "600px",
    width: "700px",
    position: "relative",
    borderRadius: "0px 50px 0px 50px",
    overflow: "hidden",
}));

const DestinationPicture: FunctionComponent<{ folder: string }> = (props) => {
    return (
        <DestinationPictureWrapper>
            <SkeletonImage
                src={destinationPictureURL(props.folder, "720p", "thumbnail")} //
                layout="fill"
                alt=""
                objectFit="cover"
                objectPosition="center"
                priority
                modalMaxResolution="1080p"
            ></SkeletonImage>
        </DestinationPictureWrapper>
    );
};

export default DestinationPicture;
