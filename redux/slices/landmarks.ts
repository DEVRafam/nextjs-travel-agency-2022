import createBetterSlice from "./_redux_templates/createSliceWithListManagement";
import { Landmark } from "@/@types/Landmark";

const { reducer, actions, helpers } = createBetterSlice<Landmark>({
    name: "test",
    listBlankItem: {
        title: "",
        description: "",
        picture: null,
        type: "ANTIQUE",
        tags: [],
        pictureURL: "",
    },
    initialState: {},
    customActions: {},
});
export { actions };
export { helpers };
export default reducer;
