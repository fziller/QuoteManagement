import Constants from "expo-constants";

const hostname = Constants.expoConfig?.extra?.HOSTNAME;

export const getProducts = async (page: number) => {
  const products = await fetch(
    `${hostname}/api/collections/products/records?page=${page}&perPage=30`
  )
    .then((res) => res.json())
    .catch((err) => console.log(err)); // Send error to Sentry or other error reporting service
  return products;
};
