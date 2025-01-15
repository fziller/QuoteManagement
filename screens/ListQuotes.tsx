import ActivityIndicatorModal from "@/components/ActivityIndicatorModal";
import PageButtons from "@/components/PageButtons";
import QuoteCard from "@/components/QuoteCard";
import QuoteStatusDropdown from "@/components/QuoteStatusDropdown";
import StatusComponent from "@/components/StatusComponent";
import useQuotes from "@/hooks/useQuotes";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Searchbar } from "react-native-paper";

export default function ListQuotes() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortTotal, setSortTotal] = useState<boolean | undefined>(undefined);

  const { getPaginatedQuotes } = useQuotes();
  const { data, isError, isFetching } = getPaginatedQuotes(
    page,
    searchQuery,
    statusFilter,
    sortTotal
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (isError) {
    return (
      <StatusComponent text="An error occured. This is the right time to panic." />
    );
  }
  if (!data?.items || data?.items.length === 0) {
    return <StatusComponent text="No quotes found." />;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
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
            if (sortTotal === undefined) setSortTotal(true);
            if (sortTotal === true) setSortTotal(false);
            if (sortTotal === false) setSortTotal(undefined);
            setPage(1);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {sortTotal !== undefined && (
              <MaterialIcons
                name={sortTotal ? "arrow-drop-up" : "arrow-drop-down"}
                size={24}
              />
            )}
            <Text style={{ fontWeight: "bold" }}>Sort by total</Text>
          </View>
        </TouchableOpacity>
      </View>
      <PageButtons
        currentPage={page}
        pages={data?.totalPages ?? 1}
        onPageSelect={(page) => setPage(page)}
      />
      <FlatList
        data={data?.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QuoteCard {...item} />}
      />
      {/* TODO Using this modal leads to keyboard being dismissed when looking for customers*/}
      <ActivityIndicatorModal isLoading={isFetching} />
    </View>
  );
}
