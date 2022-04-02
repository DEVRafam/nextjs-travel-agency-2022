import type { DestinationReview, User } from "@prisma/client";
import type { PaginationProperties } from "@/@types/pages/api/Pagination";
import type { ReviewType } from "@prisma/client";

export type BulkReviewsType = "landmarks" | "destinations"; // For `BulkReviewAPI` purpose
export type OrderBy = "latest" | "score";
export type Sort = "asc" | "desc";
export type PointsDistribution = Record<ReviewType, number>;

export interface Statistics {
    recordsInTotal: number;
    averageScore: number;
}

export interface Review {
    id: DestinationReview["id"];
    review: DestinationReview["review"];
    points: DestinationReview["points"];
    tags: string[];
    createdAt: string;
    type: ReviewType;
    reviewer: {
        id: User["id"];
        name: User["name"];
        surname: User["surname"];
        country: User["country"];
        countryCode: User["countryCode"];
        gender: User["gender"];
        avatar: User["avatar"];
        age: number; //
    };
    feedback: {
        likes: number;
        dislikes: number;
    };
}

export interface ConstructorParams {
    reviewsType: BulkReviewsType;
    reviewingModelId: string;
}

export interface ReviewsCallParams {
    limit: number | null;
    perPage: number | null;
    page: number | null;
    certianReviewType: ReviewType | null;
    orderBy: OrderBy;
    sort: Sort;
}

export interface ReviewsCallResponse {
    reviews: Review[];
    pagination?: PaginationProperties;
    pointsDistribution?: PointsDistribution;
    statistics?: Statistics;
}
