import { queryClient } from "@/networking/provider";
import { getQuotes, postQuote } from "@/networking/quotes";
import { QuoteRequest, QuoteResponse } from "@/types";
import { onlineManager, useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

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
      });

    // At least notify customer in case of being offline and failed pageload.
    !isOnline
      ? Toast.show({
          type: "error",
          text1: "Offline",
          text2: "Could not load page. Make sure to come back online",
        })
      : null;

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

  return { getPaginatedQuotes, createQuote, isOnline };
};

export default useQuotes;
