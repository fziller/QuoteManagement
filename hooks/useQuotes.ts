import { getQuotes, postQuote } from "@/networking/quotes";
import { QuoteRequest, QuoteResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useQuotes = () => {
  const queryClient = useQueryClient();

  const getPaginatedQuotes = (
    page: number,
    searchQuery: string,
    statusFilter: string,
    sort?: boolean
  ) => {
    const { data, isLoading, isError, isPending, isFetching } =
      useQuery<QuoteResponse>({
        queryKey: ["quotes", page, searchQuery, statusFilter, sort],
        queryFn: () => getQuotes(page, searchQuery, statusFilter, sort),
        placeholderData: (prev) => prev,
      });

    return { data, isLoading, isError, isFetching, isPending };
  };

  const createQuote = () => {
    const updateLocalQuoteList = (id: string, isNotSynced?: boolean) => {
      console.log("Triggering updateLocalQuoteList", { id, isNotSynced });
      queryClient.setQueryData<QuoteRequest[]>(["quotes"], (quotes) => {
        return quotes?.map((quote) => {
          if (quote.id === id) {
            return { ...quote, isNotSynced };
          }
          return quote;
        });
      });

      console.log({ current: queryClient.getQueryData(["quotes"]) });
    };

    const { mutate, isSuccess, isError, isPending, isPaused } = useMutation({
      mutationKey: ["quotes"],
      mutationFn: async (quote: QuoteRequest) => await postQuote(quote),
      onMutate: async (quote: QuoteRequest) => {
        console.log("onMutate triggered", { quote, id: quote });
        await queryClient.cancelQueries({ queryKey: ["quotes"] });
        updateLocalQuoteList(quote.id, true);
        console.log("onMutate finished");
      },
      onSuccess: (quote) => {
        console.log("CreateMutation", "Success");
        updateLocalQuoteList(quote.id, false);
      },
      onError: (error) => {
        console.log("CreateMutation", error);
      },
      networkMode: "offlineFirst",
    });

    return { mutate, isSuccess, isError, isPending, isPaused };
  };

  return { getPaginatedQuotes, createQuote };
};

export default useQuotes;
