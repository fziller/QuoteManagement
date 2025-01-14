import Divider from "@/components/Divider";
import { Quote } from "@/types";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useQuery } from "react-query";

// TODO Would be available on a production build either hardcoded or provided via build environment
const hostname = "https://feasible-amoeba-profound.ngrok-free.app";

console.log(`${hostname}/api/collections/quotes/records`);

export default function ListQuotes() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery<{ items: Quote[] }>(
    ["quotes", page],
    () =>
      fetch(
        `${hostname}/api/collections/quotes/records?page=${page}&perPage=5`,
        {
          method: "GET",
        }
      ).then((res) => res.json())
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Error. Please reload the app.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FlatList
        data={data?.items}
        renderItem={({ item }) => (
          <View
            style={{
              borderColor: "black",
              borderWidth: 0.5,
              borderRadius: 5,
              marginVertical: 2,
              padding: 5,
              marginTop: 5,
              minWidth: "95%",
              shadowColor: "#000",
              backgroundColor: "white",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 5,
              }}
            >
              <Text>{item.customer_info?.name}</Text>
              <Text>{item.customer_info?.email}</Text>
            </View>
            <Divider />
            {item.items.map((item) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 5,
                }}
              >
                <Text>{item.product_name}</Text>
                <Text>{item.price}</Text>
              </View>
            ))}
            <Divider />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 5,
                }}
              >
                <Text>Subtotal:</Text>
                <Text> {Math.round(item.subtotal * 100) / 100}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 5,
                }}
              >
                <Text>Tax:</Text>{" "}
                <Text> {Math.round(item.total_tax * 100) / 100}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 5,
                }}
              >
                <Text>Total:</Text>
                <Text>{Math.round(item.total * 100) / 100}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
