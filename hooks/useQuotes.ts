import { getQuotes, postQuote } from "@/networking/quotes";
import { QuoteRequest, QuoteResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useQuotes = () => {
  const queryClient = useQueryClient();

  const getPaginatedQuotes = (
    page: number,
    searchQuery: string,
    statusFilter: string
  ) => {
    const { data, isLoading, isError } = useQuery<QuoteResponse>({
      queryKey: ["quotes", page, searchQuery, statusFilter],
      queryFn: () => getQuotes(page, searchQuery, statusFilter),
      placeholderData: (prev) => prev,
    });

    return { data, isLoading, isError };
  };

  const createQuote = () => {
    const updateLocalQuoteList = (id: string, isNotSynced?: boolean) => {
      queryClient.setQueryData<QuoteRequest[]>(["quotes"], (quotes) => {
        return quotes?.map((quote) => {
          if (quote.id === id) {
            return { ...quote, isNotSynced };
          }
          return quote;
        });
      });
    };

    const { mutate, isSuccess, isError, isPending } = useMutation({
      mutationKey: ["create-quotes"],
      mutationFn: async (quote: QuoteRequest) => await postQuote(quote),
      onMutate: async (payload: QuoteRequest) => {
        await queryClient.cancelQueries();
        updateLocalQuoteList(payload.id, true);
      },
      onSuccess: (quote) => {
        console.log("CreateMutation", "Success");
        updateLocalQuoteList(quote.id, false);
      },
      onError: (error) => {
        console.log("CreateMutation", error);
      },
    });

    return { mutate, isSuccess, isError, isPending };
  };

  return { getPaginatedQuotes, createQuote };
};

export default useQuotes;
