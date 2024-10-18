import { client } from "@/lib/hono";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

export type FetchTemplatesResponseType = InferResponseType<
  (typeof client.api.projects)["templates"]["$get"],
  // 200 is to make sure the response type contains only the success response type
  200
>;

export const useFetchTemplates = () => {
  const query = useInfiniteQuery<FetchTemplatesResponseType, Error>({
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage;
    },
    queryKey: ["templates"],
    queryFn: async ({ pageParam = 1 }) => {
      // Note: can not use try catch here since it's not a fetch function
      const res = await client.api.projects["templates"].$get({
        query: {
          page: (pageParam as number).toString(),
          limit: "10",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch templates");
      }

      return await res.json();
    },
  });

  return query;
};
