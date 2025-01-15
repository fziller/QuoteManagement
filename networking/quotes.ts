import { QuoteRequest } from "@/types";
import Constants from "expo-constants";

const hostname = Constants.expoConfig?.extra?.HOSTNAME;

export const getQuotes = async (
  page: number,
  searchQuery: string,
  statusFilter: string
) => {
  const quotes = await fetch(
    `${hostname}/api/collections/quotes/records?page=${page}&perPage=5${filter(
      statusFilter,
      searchQuery
    )}`,
    {
      method: "GET",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.log(err)); // Send error to Sentry or other error reporting service
  return quotes;
};

export const postQuote = async (quote: QuoteRequest) =>
  fetch(`${hostname}/api/collections/quotes/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quote),
  })
    .then((res) => res.json())
    .catch((err) => console.log(err)); // Send error to Sentry or other error reporting service
// Utitlity functions
const filter = (statusFilter: string, searchQuery: string) => {
  if (statusFilter.length > 0 && searchQuery.length > 0) {
    return `&filter=(status='${statusFilter}'%20&&%20customer_info.name~'${searchQuery}')`;
  } else if (statusFilter.length > 0) {
    return `&filter=(status='${statusFilter}')`;
  } else if (searchQuery.length > 0) {
    return `&filter=(customer_info.name%20~%20'${searchQuery}')`;
  } else {
    return "";
  }
};
