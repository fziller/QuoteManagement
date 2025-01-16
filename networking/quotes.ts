import { QuoteRequest } from "@/types";
import axios from "axios";
import Constants from "expo-constants";

const hostname = Constants.expoConfig?.extra?.HOSTNAME;

export const getQuotes = async (
  page: number,
  searchQuery: string,
  statusFilter: string,
  sort?: boolean
) => {
  // Improvement: We can reduce the number of fields being returned by the API by adding
  // a field param and define what we want to receive. Less payload, faster response.
  try {
    const quotes = await axios(
      `${hostname}/api/collections/quotes/records?page=${page}&perPage=5${filter(
        statusFilter,
        searchQuery
      )}${
        sort === undefined
          ? ""
          : sort === true
          ? "&sort=-total"
          : "&sort=+total"
      }`,
      {
        method: "GET",
      }
    );
    return quotes.data;
  } catch (err) {
    console.log(err); // Send error to Sentry or other error reporting service
    throw err;
  }
};

export const postQuote = async (quote: QuoteRequest) => {
  try {
    axios(`${hostname}/api/collections/quotes/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(quote),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Utitlity functions
const filter = (statusFilter: string, searchQuery: string) => {
  if (statusFilter.length > 0 && searchQuery.length > 0) {
    return `&filter=(status='${statusFilter}'%26%26customer_info.name~'${searchQuery}')`;
  } else if (statusFilter.length > 0) {
    return `&filter=(status='${statusFilter}')`;
  } else if (searchQuery.length > 0) {
    return `&filter=(customer_info.name%20~%20'${searchQuery}')`;
  } else {
    return "";
  }
};
