import { queryClient } from "@/networking/provider";
import { getQuotes, postQuote } from "@/networking/quotes";
import { QuoteRequest, QuoteResponse } from "@/types";
import { onlineManager, useMutation, useQuery } from "@tanstack/react-query";

const useQuotes = () => {
  const isOnline = onlineManager.isOnline();

  interface CreateMutationProps {
    quote: QuoteRequest;
    handleOnSuccess: () => void;
    handleOnError: (error: any) => void;
  }

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
        staleTime: 1000 * 60 * 15, // 15 minutes. Can be extended or shortened, depending on needs.
        enabled: isOnline,
      });

    return { data, isLoading, isError, isFetching, isPending };
  };

  const createQuote = () => {
    const updateLocalQuoteList = (
      quoteRequest: QuoteRequest,
      isNotSynced?: boolean
    ) => {
      // Ignoring typescript issue as i have no idea where the issue is coming from-
      // @ts-ignore
      queryClient.setQueryData<QuoteRequest[]>(["quotes"], (quotes) => {
        if (!quotes) return [{ quoteRequest, isNotSynced }]; // Create the local array if it doesn't exist yet
        return quotes?.map((quote) => {
          if (quote.id === quoteRequest.id) {
            return { ...quote, isNotSynced };
          }
          return quote;
        });
      });
    };

    const { mutate, isSuccess, isError, isPending, isPaused } = useMutation({
      mutationKey: ["quotes"],
      mutationFn: async ({ quote }: CreateMutationProps) =>
        await postQuote(quote),
      onMutate: async ({ quote }) => {
        // Make sure to update the state locally first in case of being offline.
        await queryClient.cancelQueries({ queryKey: ["quotes"] });
        updateLocalQuoteList(quote, true);
      },
      onSuccess: (data, { quote, handleOnSuccess }, context) => {
        updateLocalQuoteList(quote, false);
        queryClient.invalidateQueries({
          // Make sure we are able to fetch the latest quote data
          queryKey: ["quotes"],
          refetchType: "none",
        });
        handleOnSuccess();
      },
      onError: (error, { handleOnError }) => {
        handleOnError(error);
      },
      retry: true,
      retryDelay: 1000,
    });

    return { mutate, isSuccess, isError, isPending, isPaused };
  };

  return { getPaginatedQuotes, createQuote };
};

export default useQuotes;
