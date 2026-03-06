// editorialApi.js
import { baseApi } from "./baseApi";

export const editorialApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEditorials: builder.query({
            query: () => "website/editorial",
            providesTags: ["Editorial"],
        }),
        createEditorial: builder.mutation({
            query: (formData) => ({
                url: "website/editorial",
                method: "POST",
                body: formData, 
            }),
            invalidatesTags: ["Editorial"],
        }),
        updateEditorial: builder.mutation({
            query: ({ id, formData }) => ({
                url: `website/editorial/${id}`,
                method: "PUT",
                body: formData, 
            }),
            invalidatesTags: ["Editorial"],
        }),
        deleteEditorial: builder.mutation({
            query: (id) => ({
                url: `website/editorial/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Editorial"],
        }),
    }),
});

export const {
    useGetEditorialsQuery,
    useCreateEditorialMutation,
    useUpdateEditorialMutation,
    useDeleteEditorialMutation,
} = editorialApi;