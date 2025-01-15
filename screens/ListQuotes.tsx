import ActivityIndicatorModal from "@/components/ActivityIndicatorModal";
import PageButtons from "@/components/PageButtons";
import QuoteCard from "@/components/QuoteCard";
import QuoteStatusDropdown from "@/components/QuoteStatusDropdown";
import useQuotes from "@/hooks/useQuotes";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Searchbar } from "react-native-paper";

export default function ListQuotes() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { getPaginatedQuotes } = useQuotes();
  const { data, isLoading, isError } = getPaginatedQuotes(
    page,
    searchQuery,
    statusFilter
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Initial fetch should show the indicator until data is fetched
  if (!data && isLoading) {
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
      <PageButtons
        currentPage={page}
        pages={data?.totalPages ?? 1}
        onPageSelect={(page) => setPage(page)}
      />

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
      <ActivityIndicatorModal isLoading={isLoading} />
    </View>
  );
}
