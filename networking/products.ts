import axios from "axios";
import Constants from "expo-constants";

const hostname = Constants.expoConfig?.extra?.HOSTNAME;

export const getProducts = async (page: number) => {
  try {
    const products = await axios(
      `${hostname}/api/collections/products/records?page=${page}&perPage=30`
    );
    return products.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
