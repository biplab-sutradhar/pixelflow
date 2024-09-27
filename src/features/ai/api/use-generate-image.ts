import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type RequestType = InferRequestType<
  (typeof client.api.replicate)["generate-image"]["$post"]
>["json"];
type ResponseType = InferResponseType<
  (typeof client.api.replicate)["generate-image"]["$post"]
>;

export const useGenerateImage = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (data) => {
      const res = await client.api.replicate["generate-image"].$post({
        json: data,
      });

      if (!res.ok) {
        throw new Error("Failed to generate image");
      }

      return await res.json();
    },
  });

  return mutation;
};
