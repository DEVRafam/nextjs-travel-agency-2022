// Tools
import { prisma } from "@/prisma/db";
import { styled } from "@mui/system";
// Types
import type { GetStaticPaths, GetStaticProps } from "next";
import type { FunctionComponent } from "react";
import type { Destination } from "@/@types/pages/SingleDestination";
// Material UI Components
import Box from "@mui/material/Box";
// Other components
import Landing from "@/components/destinations/single/landing/Landing";
import Description from "@/components/destinations/single/DescriptionWrapper";
// Redux
import { useAppDispatch } from "@/hooks/useRedux";
import { setData } from "@/redux/slices/singleDestination";
// Styled components
const Wrapper = styled(Box)(({ theme }) => ({
    width: "100vw",
    position: "relative",
}));
const Content = styled(Box)({
    width: "100vw",
    position: "relative",
    marginTop: "100vh",
});

interface SingleDestinationProps {
    destination: Destination;
}

const SingleDestination: FunctionComponent<SingleDestinationProps> = (props) => {
    const dispatch = useAppDispatch();
    dispatch(setData(props.destination));

    return (
        <Wrapper sx={{ color: "text.primary" }}>
            <Landing></Landing>
            <Content>
                <Description></Description>
            </Content>
        </Wrapper>
    );
};

export default SingleDestination;

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = (await prisma.destination.findMany({ select: { slug: true } })).map((item) => ({
        params: { slug: item.slug },
    }));
    return {
        paths,
        fallback: "blocking",
    };
};

export const getStaticProps: GetStaticProps<{ destination: Destination }, { slug: string }> = async (context) => {
    try {
        if (!context?.params?.slug) throw new Error();

        const destination = await prisma.destination.findUnique({
            where: {
                slug: context.params.slug,
            },
            select: {
                slug: true,
                city: true,
                country: true,
                population: true,
                continent: true,
                shortDescription: true,
                description: true,
                folder: true,
                landmarks: {
                    select: {
                        slug: true,
                        title: true,
                        picture: true,
                        type: true,
                    },
                },
            },
        });
        if (!destination) throw new Error();

        return {
            props: {
                destination: destination as unknown as Destination,
            },
        };
    } catch (e: unknown) {
        return {
            redirect: {
                destination: "/404",
                permanent: false,
            },
        };
    }
};
