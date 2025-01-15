import QuoteCard from "@/components/QuoteCard";
import QuoteStatusDropdown from "@/components/QuoteStatusDropdown";
import { QuoteResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Modal, Searchbar } from "react-native-paper";

// TODO Would be available on a production build either hardcoded or provided via build environment
const hostname = Constants.expoConfig?.extra?.HOSTNAME;

export default function ListQuotes() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isError, isFetching } = useQuery<QuoteResponse>({
    queryKey: ["quotes", page, searchQuery, statusFilter],
    queryFn: () =>
      fetch(
        `${hostname}/api/collections/quotes/records?page=${page}&perPage=5${filter()}`,
        {
          method: "GET",
        }
      ).then((res) => res.json()),
  });

  console.log({ data, page, statusFilter, searchQuery });

  // TODO Make filter and search work both at the same time
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
          marginHorizontal: 10,
        }}
      >
        <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 20 }}>
          {data
            ? "was anders"
            : "Could not load any data. Make sure to have a internet connection and restart the app."}
        </Text>
      </View>
    );
  }

  // TODO make buttons action float buttons
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
        <QuoteStatusDropdown
          onSelect={(selectedItem) => {
            setStatusFilter(selectedItem);
            setPage(1);
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
