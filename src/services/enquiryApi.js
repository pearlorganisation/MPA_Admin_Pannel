// services/enquiryApi.js
import { baseApi } from "./baseApi";

export const enquiryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Admin: Get all enquiries
        getEnquiries: builder.query({
            query: () => "/enquiry", // Ensure ye path aapke backend route se match kare
            providesTags: ["Enquiry"],
        }),
        // User: Send enquiry
        createEnquiry: builder.mutation({
            query: (formData) => ({
                url: "/enquiry/send",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Enquiry"],
        }),
        // Admin: Delete enquiry
        deleteEnquiry: builder.mutation({
            query: (id) => ({
                url: `/enquiry/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Enquiry"],
        }),
        // Admin: Mark as read (Optional but recommended for your model)
        markEnquiryRead: builder.mutation({
            query: (id) => ({
                url: `/enquiry/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["Enquiry"],
        })
    }),
});

export const {
    useGetEnquiriesQuery,
    useCreateEnquiryMutation,
    useDeleteEnquiryMutation,
    useMarkEnquiryReadMutation
} = enquiryApi;