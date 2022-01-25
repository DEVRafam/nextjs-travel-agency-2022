import { Gender } from "@prisma/client";
// import restrictons from '@/utils/restrictions/'

describe("Register Page", () => {
    before(() => {
        cy.visit(env().urls.register);
    });
    const testWhetherButtonIsDisabled = (disabled: boolean) => {
        if (disabled) cy.getByCyTag("step-nav-go-further").should("have.attr", "disabled", "disabled");
        else cy.getByCyTag("step-nav-go-further").should("not.have.attr", "disabled");
    };
    describe("Redirections", () => {
        beforeEach(() => {
            cy.visit(env().urls.register);
        });
        after(() => {
            cy.visit(env().urls.register);
        });
        it("Main Page button should work", () => {
            cy.get('button[data-cy="redirect-main-page"]').click();
            cy.location("pathname").should("equal", "/");
        });
        it("Login button should work", () => {
            cy.get('button[data-cy="redirect-login"]').click();
            cy.location("pathname").should("equal", env().urls.login);
        });
    });
    describe("STEP 1- Personal Information", () => {
        const pickTheCountry = () => {
            return cy
                .getByCyTag("country")
                .click()
                .then(() => cy.getByCyTag("country-Pakistan").click());
        };
        beforeEach(() => {
            cy.getByCyTag("name").clear();
            cy.getByCyTag("surname").clear();
            cy.getByCyTag("country").clear();
            cy.get(`[data-cy="born"] input`).clear();
        });
        it("User should be able to sacrifice their live for Pakistani!", () => {
            cy.log("Select element should work 🚀");
            pickTheCountry().then(() => {
                cy.getByCyTag("country").should("have.attr", "value", "Pakistan");
            });
        });

        describe("Continue button should remain blocked", () => {
            it("When everything is blank", () => {
                testWhetherButtonIsDisabled(true);
            });
            it("When name is invalid", () => {
                cy.getByCyTag("name").type(env().data.name.invalid);
                cy.getByCyTag("surname").type(env().data.surname.valid);
                cy.get(`[data-cy="born"] input`).type(env().data.born.valid);
                pickTheCountry();
                testWhetherButtonIsDisabled(true);

                cy.getByCyTag("name").clear().type(env().data.name.valid);
                testWhetherButtonIsDisabled(false);
            });
            it("When surname is invalid", () => {
                cy.getByCyTag("name").type(env().data.name.valid);
                cy.getByCyTag("surname").type(env().data.surname.invalid);
                cy.get(`[data-cy="born"] input`).type(env().data.born.valid);
                pickTheCountry();
                testWhetherButtonIsDisabled(true);

                cy.getByCyTag("surname").clear().type(env().data.name.valid);
                testWhetherButtonIsDisabled(false);
            });
            it("When country is not selected", () => {
                cy.getByCyTag("surname").type(env().data.surname.valid);
                cy.getByCyTag("name").type(env().data.name.valid);
                cy.get(`[data-cy="born"] input`).type(env().data.born.valid);
                testWhetherButtonIsDisabled(true);

                pickTheCountry();
                testWhetherButtonIsDisabled(false);
            });
            it("When born is invalid", () => {
                cy.getByCyTag("surname").type(env().data.surname.valid);
                cy.getByCyTag("name").type(env().data.name.valid);
                cy.get(`[data-cy="born"] input`).type(env().data.born.invalid);
                pickTheCountry();
                testWhetherButtonIsDisabled(true);

                cy.get(`[data-cy="born"] input`).type(env().data.born.valid);
                testWhetherButtonIsDisabled(false);
            });

            it("Ensure that women and other genders are able to create an account", () => {
                const selectGender = (gender: Gender) => {
                    cy.getByCyTag("gender")
                        .click()
                        .then(() => {
                            cy.getByCyTag(`gender-${gender}`).click();
                            cy.get(`[data-cy="gender"] input`).should("have.attr", "value", gender);
                        });
                    //
                };
                cy.getByCyTag("surname").type(env().data.surname.valid);
                cy.getByCyTag("name").type(env().data.name.valid);
                cy.get(`[data-cy="born"] input`).type(env().data.born.valid);
                pickTheCountry();
                selectGender("FEMALE");
                testWhetherButtonIsDisabled(false);
                selectGender("OTHER");
                testWhetherButtonIsDisabled(false);
                testWhetherButtonIsDisabled(false);
                selectGender("MALE");
            });
        });
    });

    describe("STEP 2- Credentials", () => {
        before(() => {
            cy.getByCyTag("name").clear().type(env().data.name.valid);
            cy.getByCyTag("surname").clear().type(env().data.surname.valid);
            cy.get(`[data-cy="born"] input`).clear().type(env().data.born.valid);
            cy.getByCyTag("country")
                .click()
                .then(() => cy.getByCyTag("country-Pakistan").click());
            cy.getByCyTag("gender")
                .click()
                .then(() => {
                    cy.getByCyTag(`gender-OTHER`).click();
                });
            cy.getByCyTag("step-nav-go-further").click();
        });
        beforeEach(() => {
            cy.getByCyTag("email").clear();
            cy.getByCyTag("password").clear();
            cy.getByCyTag("repeat-password").clear();
        });
        it("User should be able to return to STEP 1- Personal Information and vice versa", () => {
            cy.getByCyTag("step-nav-go-back")
                .click()
                .then(() => {
                    cy.getByCyTag("register-step").should("have.text", "User Data");
                    cy.getByCyTag("step-nav-go-further")
                        .click()
                        .then(() => {
                            cy.getByCyTag("register-step").should("have.text", "Credentials");
                            cy.getByCyTag;
                        });
                });
        });
        it("User should be able to change visibility of password", () => {
            cy.checkPasswordElementVisibility("password");
        });
        it("User should be able to change visibility of password's repetition", () => {
            cy.checkPasswordElementVisibility("password");
        });
        it("User should be notified when email address is not available", () => {
            cy.getByCyTag("email").type(env().credentials.admin.email);
            cy.getByCyTag("email-error").should("have.text", "Email address is not available");
            cy.getByCyTag("email").clear().type("cypress_is_fking_awasome6@gmail.com").blur();
            cy.getByCyTag("email-error").should("not.exist");
        });
        //
        describe("Continue button should remain blocked", () => {
            testLengthOfAllProperitesInList({
                list: {
                    email: env().data.email,
                    password: env().data.password,
                    "repeat-password": env().data.password,
                },
                assertion: (state: boolean) => testWhetherButtonIsDisabled(state),
            });
        });
    });

    describe("STEP 3- Avatar", () => {
        //
    });

    describe("STEP 4- Confirmation", () => {
        //
    });
});
