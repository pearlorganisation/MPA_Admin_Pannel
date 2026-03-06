import { baseApi } from "./baseApi";

export const manuscriptApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitManuscript: builder.mutation({
            query: (formData) => ({
                url: "/manuscripts/submit",
                method: "POST",
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        getMySubmissions: builder.query({
            query: () => "/manuscripts/my-submissions",
            providesTags: ["Manuscripts"],
        }),

        getAllSubmissions: builder.query({
            query: ({ page = 1, limit = 10 } = {}) =>
                `/manuscripts/admin/all?page=${page}&limit=${limit}`,
        }),

        assignEditor: builder.mutation({
            query: (data) => ({
                url: "/manuscripts/admin/assign-editor",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        updateStatus: builder.mutation({
            query: (data) => ({
                url: "/manuscripts/admin/update-status",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        assignReviewers: builder.mutation({
            query: (data) => ({
                url: "/manuscripts/admin/assign-reviewers",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Manuscripts"],
        }),
        getAssignedToEditor: builder.query({
            query: (data) => ({
                url: "/manuscripts/editor/assignments",
                method: "GET",
            }),
            providesTags: ["Manuscripts"],
        })
    }),
});

export const {
    useSubmitManuscriptMutation,
    useGetMySubmissionsQuery,
    useGetAllSubmissionsQuery,
    useAssignEditorMutation,
    useUpdateStatusMutation,
    useAssignReviewersMutation,
    useGetAssignedToEditorQuery, 
} = manuscriptApi;