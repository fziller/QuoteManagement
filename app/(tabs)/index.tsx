import QuoteCard from "@/components/QuoteCard";
import { QuoteResponse } from "@/types";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Modal, Searchbar } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";
import { useQuery } from "react-query";

// TODO Would be available on a production build either hardcoded or provided via build environment
const hostname = "https://feasible-amoeba-profound.ngrok-free.app";

console.log(`${hostname}/api/collections/quotes/records`);

export default function ListQuotes() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isError, isFetching } = useQuery<QuoteResponse>(
    ["quotes", page, searchQuery, statusFilter],
    () =>
      fetch(
        `${hostname}/api/collections/quotes/records?page=${page}&perPage=5${filter()}`,
        {
          method: "GET",
        }
      ).then((res) => res.json()),
    {
      keepPreviousData: true,
    }
  );

  console.log({ data, page, statusFilter, searchQuery });

  const filter = () => {
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Initial fetch should show the indicator until data is fetched
  if (!data && isFetching) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" animating />
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

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; data?.totalPages && i <= data?.totalPages; i++) {
      buttons.push(
        <View
          key={i}
          style={{
            marginVertical: 10,
            marginHorizontal: 5,
            padding: 5,
            borderWidth: 1,
            borderRadius: 50,
            width: 40,
            height: 40,
            backgroundColor: page === i ? "green" : "white",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ textAlign: "center" }} onPress={() => setPage(i)}>
            {i}
          </Text>
        </View>
      );
    }
    return (
      <ScrollView
        horizontal
        style={{ marginVertical: 10, marginHorizontal: 5 }}
        showsHorizontalScrollIndicator={false}
      >
        {buttons}
      </ScrollView>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Searchbar
        placeholder="Name or email ..."
        value={searchQuery}
        onChangeText={(input) => {
          handleSearch(input);
        }}
        style={{
          marginVertical: 10,
          marginHorizontal: 10,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minWidth: "95%",
        }}
      >
        <SelectDropdown
          data={["PENDING", "REJECTED", "ACCEPTED", "DRAFT", "EXPIRED", "SENT"]}
          onSelect={(selectedItem, index) => {
            setStatusFilter(selectedItem);
            setPage(1);
          }}
          renderButton={() => (
            <View
              style={{
                marginVertical: 10,
                marginHorizontal: 5,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Filter by status</Text>
            </View>
          )}
          renderItem={(selectedItem, index) => {
            return (
              <View
                style={{
                  marginVertical: 10,
                  marginHorizontal: 5,
                  minWidth: "95%",
                }}
              >
                <Text>{selectedItem}</Text>
              </View>
            );
          }}
        />
        <TouchableOpacity
          onPress={() => {
            setStatusFilter("");
            setPage(1);
          }}
        >
          <Text>Sort by total</Text>
        </TouchableOpacity>
      </View>
      {renderPageButtons()}
      {data?.items.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>No quotes found</Text>
        </View>
      )}
      <FlatList
        data={data?.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QuoteCard {...item} />}
      />
      <Modal
        visible={isFetching}
        children={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" animating />
          </View>
        }
      />
    </View>
  );
}
