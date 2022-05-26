/**
 * @jest-environment node
 */
// Tools
import prisma from "../../helpers/db";
import MockLandmark from "../../helpers/mocks/MockLandmark";
import MockDestination from "../../helpers/mocks/MockDestination";
import makeRequest from "../../helpers/landmarks/bulk/makeRequest";
// "Expectators"
import testPaginations from "../../helpers/testPagination";
import expectAllRecordsToBeApproved from "../../helpers/landmarks/bulk/expectAllRecordsToBeApproved";
import expectAllRecordsToHaveTheSameType from "../../helpers/landmarks/bulk/expectAllRecordsToHaveTheSameType";
import expectAllRecordsToBeOnTheSameContinent from "../../helpers/landmarks/bulk/expectAllRecordsToBeOnTheSameContinent";
// Types
import type { LandmarkType, Continent } from "@prisma/client";
import type { Landmark } from "@/@types/pages/landmarks/ManyLandmarks";

describe("GET: api/landmark/bulk", () => {
    describe("Of particular type", () => {
        const testParticularType = (type: LandmarkType) => {
            describe(type, () => {
                // Mocked records
                const mockedDestination = new MockDestination();
                const mockedLandmark = new MockLandmark({ type });
                //
                let data: Landmark[] = [];
                beforeAll(async () => {
                    // Create mocked landmark, just for the sake of testing.
                    await mockedDestination.prepare();
                    await mockedLandmark.prepare(mockedDestination.id);

                    const res = await makeRequest({
                        certainLandmarkType: type,
                    });
                    data = res.data;
                });
                afterAll(async () => {
                    // It is not neccesary to remove mockedLandmark, due to the
                    // CASCADE relation between landmark and destination models
                    await mockedDestination.remove();
                });

                test("All records have the same type", () => {
                    expectAllRecordsToHaveTheSameType(data, type);
                });
                test("All results are APPROVED", async () => {
                    await expectAllRecordsToBeApproved(data);
                });
            });
        };

        const ALL_TYPES: LandmarkType[] = ["ANTIQUE", "ART", "BUILDING", "MONUMENT", "MUSEUM", "NATURE", "RESTAURANT"];
        for (const type of ALL_TYPES) {
            testParticularType(type);
        }

        testPaginations({
            getAllAvailableData: async () =>
                await prisma.landmark.findMany({
                    where: {
                        type: "BUILDING",
                    },
                    select: {
                        slug: true,
                    },
                }),
            loadPage: async (page: number) =>
                await makeRequest({
                    certainLandmarkType: "BUILDING",
                    page,
                    perPage: 2,
                }),
        });
    });
    describe("On particular continent", () => {
        const testParticularContinent = (continent: Continent) => {
            describe(continent, () => {
                let data: Landmark[] = [];
                const mockedDestination = new MockDestination({ continent });
                const mockedLandmark = new MockLandmark();
                beforeAll(async () => {
                    const res = await makeRequest({ continent });
                    data = res.data;
                    await mockedDestination.prepare();
                    await mockedLandmark.prepare(mockedDestination.id);
                });
                afterAll(async () => {
                    // It is not neccesary to remove mockedLandmark, due to the
                    // CASCADE relation between landmark and destination models
                    await mockedDestination.remove();
                });

                test("All records are on the same continent", () => {
                    expectAllRecordsToBeOnTheSameContinent(data, continent);
                });
                test("All results are APPROVED", async () => {
                    await expectAllRecordsToBeApproved(data);
                });
            });
        };

        const ALL_CONTINENTS: Continent[] = ["Africa", "Asia", "Australia_Oceania", "Europe", "North_America", "South_America"];
        for (const continent of ALL_CONTINENTS) {
            testParticularContinent(continent);
        }

        testPaginations({
            getAllAvailableData: async () =>
                await prisma.landmark.findMany({
                    where: {
                        destination: {
                            continent: "Europe",
                        },
                    },
                    select: {
                        slug: true,
                    },
                }),
            loadPage: async (page: number) =>
                await makeRequest({
                    continent: "Europe",
                    page,
                    perPage: 2,
                }),
        });
    });
    describe("Searching phrase", () => {
        test("Not approved content cannot be displayed", async () => {
            const mockedDestination = new MockDestination();
            const mockedLandmark = new MockLandmark();
            await mockedDestination.prepare();
            await mockedLandmark.prepare(mockedDestination.id);
            //
            const res = await makeRequest({ searchingPhrase: mockedLandmark.title });
            expect(res.data).toHaveLength(0);

            // It is not neccesary to remove mockedLandmark, due to the
            // CASCADE relation between landmark and destination models
            await mockedDestination.remove();
        });

        describe("In particular city", () => {
            const testLandmarksInParticualCity = (label: string, searchingPhrase: string) => {
                describe(label, () => {
                    let data: Landmark[] = [];
                    beforeAll(async () => {
                        const res = await makeRequest({ searchingPhrase });
                        data = res.data;
                        expect(data.length).toBeGreaterThan(0);
                    });

                    test("All records are in expected city", () => {
                        data.forEach((landmark) => {
                            expect(landmark.destination.city).toEqual("Hamburg");
                        });
                    });
                    test("All results are APPROVED", async () => {
                        await expectAllRecordsToBeApproved(data);
                    });
                });
            };

            testLandmarksInParticualCity("Identical city name", "Hamburg");
            testLandmarksInParticualCity("Partial city name", "Ham");
            testLandmarksInParticualCity("Uppercased city name", "HAMB");
            testLandmarksInParticualCity("Lowercased city name", "hambur");
            testLandmarksInParticualCity("Irregular cased city name", "HaMbURg");

            testPaginations({
                getAllAvailableData: async () =>
                    await prisma.landmark.findMany({
                        where: {
                            destination: {
                                city: "Hamburg",
                            },
                        },
                        select: {
                            slug: true,
                        },
                    }),
                loadPage: async (page: number) =>
                    await makeRequest({
                        searchingPhrase: "Ham",
                        page,
                        perPage: 2,
                    }),
            });
        });

        describe("Specific landmark", () => {
            const testOnlyOneSpecificLandmark = (label: string, searchingPhrase: string) => {
                describe(label, () => {
                    let data: Landmark[] = [];
                    beforeAll(async () => {
                        const res = await makeRequest({ searchingPhrase });
                        data = res.data;
                        expect(data.length).toBeGreaterThan(0);
                    });

                    test("The only result is an expected landmark", () => {
                        data.forEach((landmark) => {
                            expect(landmark.title).toEqual("Fiction Park");
                        });
                        expect(data).toHaveLength(1);
                    });
                    test("All results are APPROVED", async () => {
                        await expectAllRecordsToBeApproved(data);
                    });
                });
            };
            testOnlyOneSpecificLandmark("Identical landmark name", "Fiction Park");
            testOnlyOneSpecificLandmark("Partial landmark name", "Ficti");
            testOnlyOneSpecificLandmark("Uppercased landmark name", "FICTION PARK");
            testOnlyOneSpecificLandmark("Lowercased landmark name", "fiction p");
            testOnlyOneSpecificLandmark("Irregular cased landmark name", "FiCTIoN PArK");
        });
    });
});
