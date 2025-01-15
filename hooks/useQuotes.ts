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
    const updateLocalQuoteList = (
      quoteRequest: QuoteRequest,
      isNotSynced?: boolean
    ) => {
      console.log("Triggering updateLocalQuoteList", {
        quoteRequest,
        isNotSynced,
      });

      queryClient.setQueryData<QuoteRequest[]>(["quotes"], (quotes) => {
        console.log("Do we have any quote in our query data?", quotes);
        if (!quotes) return [{ quoteRequest, isNotSynced }];
        return quotes?.map((quote) => {
          console.log("Looping through quotes, quote:", quote);
          if (quote.id === quoteRequest.id) {
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
        console.log("onMutate triggered", { quote, id: quote.id });
        await queryClient.cancelQueries({ queryKey: ["quotes"] });
        updateLocalQuoteList(quote, true);
        console.log("onMutate finished");
      },
      onSuccess: (data, variables, context) => {
        console.log("CreateMutation Success", { data, variables, context });
        updateLocalQuoteList(variables, false);
      },
      onError: (error) => {
        console.log("CreateMutation error", error);
      },
      retry: true,
      retryDelay: 1000,
    });

    return { mutate, isSuccess, isError, isPending, isPaused };
  };

  return { getPaginatedQuotes, createQuote };
};

export default useQuotes;
