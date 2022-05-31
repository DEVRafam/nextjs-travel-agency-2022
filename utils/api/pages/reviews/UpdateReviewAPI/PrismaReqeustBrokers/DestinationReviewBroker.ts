// Tools
import { prisma } from "@/prisma/db";
import CircumstancesValidator from "../../_abstracts/CircumstancesValidator";
// Types
import type { ReviewType } from "@prisma/client";
import type { PrismaRequestBrokerConstructorParams, PrismaRequestBroker, UpdateRecordMethodParams } from "../@types";

export default class DestinationReviewBroker extends CircumstancesValidator implements PrismaRequestBroker {
    public constructor(params: PrismaRequestBrokerConstructorParams) {
        super({
            authenticationResponse: params.authenticationResponse,
            idOfElementAssociatedWithReview: params.idOfElementAssociatedWithReview,
            idOfReview: params.idOfReview,
            modelType: "destination",
        });
    }

    public async updateRecord(params: UpdateRecordMethodParams): Promise<void> {
        await this.ensureThatRecordExistsAndUserIsEntitledToDoIndendedAction();

        await prisma.destinationReview.update({
            where: {
                id: this.idOfReview,
            },
            data: {
                points: params.points,
                tags: params.tags as any,
                review: params.reviewContent,
                type: this.generateReviewType(params.points),
            },
        });
    }

    protected generateReviewType(points: number): ReviewType {
        if (points > 0.7) return "POSITIVE";
        else if (points < 0.4) return "MIXED";
        return "NEGATIVE";
    }
}
