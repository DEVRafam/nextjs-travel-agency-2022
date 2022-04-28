import { prisma } from "@/prisma/db";
import transformPrismaNastedModels from "@/utils/api/transformPrismaNastedModels";
import BulkAPIsURLQueriesHandler from "@/utils/api/abstracts/BulkAPIsURLQueriesHandler";
// Types
import type { NextApiRequest } from "next";
import type { PaginationProperties } from "@/@types/pages/api/Pagination";
import type { ExtraProperty } from "@/@types/pages/api/BulkAPIsURLQueriesHandler";

interface BulkDataAPICreatorProps<PrismaModelSelect> {
    req: NextApiRequest;
    model: "destination" | "landmark";
    extraProperties?: ExtraProperty[];
    sortable: (keyof PrismaModelSelect)[];
    propertiesForSearchingPhrase?: string[];
}

interface GetDataResponse<ExpectedData> {
    data: ExpectedData;
    pagination?: PaginationProperties;
}

/**
 * Abstract `BulkDataAPI` comes hauntingly handy when striving to manage bulk pieces of data and use features such as
 * - pagination,
 * - get records containing a phrase,
 * - get only records with specific value of particual property (*for instance `continent`===`"Europe"`*)
 *
 * ### Generics
 * 1. The first generic comes from **Prisma namespace** and is responsible for organizing selection of model properties. In other words it something alike `Prisma.LandmarkSelect`
 * 2. The second generic describes extra properties comming from `req.query`
 *
 *
 * ### Params
 * All params are wrapped into one object so as to keep everything organized. The arguments object has folowing properties:
 * - `req`- just `NextApiRequest`
 * - `model`- either `"destination"` or `"landmark"`- it is just a reference to the **prisma** model name, nothing more so it can be easly extended by new model's names in the future without any worry about prospective incompatibility
 * - `extraProperties`- **optional**- extra properties for `BulkAPIsURLQueriesHandler` abstract. It's an array of objects representing all extra properties from `req.query` which are going to be merged into `queriesFormRequest` property
 * - `sortable`- just an array of **prisma** model properties which are going to be used to sort records (*for instance `createdAt`*)
 * - `propertiesForSearchingPhrase`- model properties which are going to be compared with received searching phrase. Those properties can be written in following convention `"destination.country"` so as to enable making comparisions with nested, related models.
 */
export default abstract class BulkDataAPI<PrismaModelSelect, ExtraProperties extends {}> extends BulkAPIsURLQueriesHandler<ExtraProperties> {
    private propertiesForSearchingPhrase?: string[];
    private model: "destination" | "landmark";

    public constructor(props: BulkDataAPICreatorProps<PrismaModelSelect>) {
        super(
            props.req as any, //
            props.sortable as string[],
            props.extraProperties ?? []
        );

        this.model = props.model;
        this.propertiesForSearchingPhrase = props.propertiesForSearchingPhrase;
    }

    protected async _getData<ExpectedData>(prismaSelectBody: PrismaModelSelect): Promise<GetDataResponse<ExpectedData>> {
        const result: ExpectedData = await (prisma[this.model] as any).findMany(this._createPrismaRequestBody({ prismaSelectBody }));

        const recordsInTotal = await this._getAmountOfRecordsInTotal();
        const pagination = this.establishPaginationProperties(recordsInTotal);

        return {
            data: result,
            ...(pagination ? { pagination } : null),
        };
    }

    /**
     * Combine together all following properties:
     * 1. **ALWAYS**-  `where` is always applied in order to use this function for both data quering and aggregate call purposes
     *      - all `compareWith` extra properties comming from `req.query`
     *      - `searchingPhrase` from `req.query` working alongside with `propertiesForSearchingPhrase`
     *
     * 2. **CONDITIONALLY**- only (when `shorten` argument is `true`)- handle related with pagination properties
     * - `take`, `skip`, `limit`
     *
     * 3. **CONDITIONALLY**- only (when `prismaSelectBody` argument is `true`)- get only specific properties from prisma model
     * - `select`,
     */
    private _createPrismaRequestBody(params?: { shorten?: boolean; prismaSelectBody?: PrismaModelSelect }) {
        const { where, ...generatedPrismaBody } = this.converURLQueriesIntoPrismaBody();

        return {
            where: {
                ...where,
                ...this._handleSearchingPhrase(),
            },
            ...(!params?.shorten && {
                ...generatedPrismaBody,
                ...(params?.prismaSelectBody && { select: params.prismaSelectBody }),
            }),
        };
    }

    private _handleSearchingPhrase() {
        const _searchingPhrase: string | null = (this.quriesFromRequest as any).searchingPhrase ?? null;
        if (!this.propertiesForSearchingPhrase || !_searchingPhrase) return {};
        const searchingPhrase = _searchingPhrase.toLowerCase();

        const transform = (prop: string) => transformPrismaNastedModels(prop, searchingPhrase, "contains");

        return {
            OR: this.propertiesForSearchingPhrase.map(transform),
        };
    }

    private async _getAmountOfRecordsInTotal(): Promise<number> {
        interface Result {
            _count: { _all: number };
        }

        const result = (await (prisma[this.model] as any).aggregate({
            _count: { _all: true },
            ...(this._createPrismaRequestBody({ shorten: true }) as any),
        })) as Result;

        return result._count._all;
    }
}
