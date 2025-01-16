import axios from "axios";
import Constants from "expo-constants";

const hostname = Constants.expoConfig?.extra?.HOSTNAME;

export const getProducts = async (page: number) => {
  try {
    console.log({ hostname });
    const products = await axios(
      `${hostname}/api/collections/products/records?page=${page}&perPage=30`
    );
    return products.data;
  } catch (error) {
    console.log(error); // This should properly log an error message to an error reporting tool.--
    throw error;
  }
};
