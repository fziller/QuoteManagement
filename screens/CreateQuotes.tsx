import InputComponent from "@/components/InputComponent";
import useCalculateTotals, {
  TotalsActionType,
} from "@/hooks/useCalculateTotals";
import useQuotes from "@/hooks/useQuotes";
import { Product, ProductResponse, QuoteStatus } from "@/types";
import { validateEmail } from "@/utils/stringUtils";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid/non-secure"; // Only works with non-secure nanoid.
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import Toast from "react-native-toast-message";

export default function CreateQuotes() {
  const queryClient = useQueryClient();

  const theme = useTheme();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [theProducts, setTheProducts] = useState<Product[]>([]);
  const { dispatch, state: totalsState } = useCalculateTotals();
  const { createQuote } = useQuotes();

  const { mutate: quoteMutate, isError, isPending, isSuccess } = createQuote();

  useEffect(() => {
    const subtotal = selectedProducts.reduce((acc, product) => {
      return acc + Number(flatProducts.find((p) => p.title === product)?.price);
    }, 0);

    dispatch({ type: TotalsActionType.SET_SUBTOTAL, payload: subtotal });
  }, [selectedProducts]);

  // Product data should already be fetched at this point.
  // TODO Make sure that data is being fetched and view rerender when application is started offline for the very first time
  // and no product cache was set at all.
  let products: ProductResponse = queryClient.getQueryData(["products"]) ?? {
    pageParams: [],
    pages: [],
  };

  // Get the proper format out of the cached data
  const flatProducts: Product[] = products.pages
    .map((productResponse) => {
      return productResponse.items;
    })
    .flat();

  const handleSubmit = () => {
    // Create list of all items, which were previously selected.
    const items = selectedProducts.map((product) => {
      const productItem = flatProducts.find(
        (p: Product) => p.title === product
      );
      return {
        product_name: productItem?.title,
        price: productItem?.price,
        quantity: 1,
        subtotal: productItem?.price,
      };
    });

    // Create list of all items, which were previously selected.
    quoteMutate({
      quote: {
        id: nanoid(15), // Need to be 15 chars long.
        customer_info: {
          name: customerName,
          email: customerEmail,
        },
        items,
        // Assumption: Set to DRAFT as we might need validation in backend or send products before wrapping it up.
        status: QuoteStatus.DRAFT,
        subtotal: totalsState.subtotal,
        total: totalsState.total,
        total_tax: totalsState.totalTax,
      },
      handleOnSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Quote created successfully",
          visibilityTime: 4000,
        });
      },
      handleOnError: (error) => {
        Toast.show({
          type: "error",
          text1: "Something went wrong",
          text2: error.message,
          visibilityTime: 4000,
        });
      },
    });
  };

  return (
    <View style={{ gap: 10, marginHorizontal: 10, marginTop: 10 }}>
      <InputComponent
        label="Customer name"
        placeholder="Enter name of customer ..."
        onChangeText={(name) => {
          setCustomerName(name);
        }}
        value={customerName}
        error={customerName === ""}
      />
      <TextInput
        label="Customer email"
        placeholder="Enter email of customer ..."
        keyboardType="email-address"
        value={customerEmail}
        onChangeText={(email) => {
          setCustomerEmail(email);
        }}
        error={customerEmail === "" || !validateEmail(customerEmail)}
      />
      <TextInput
        label="Subtotal"
        value={totalsState.subtotal.toString()}
        disabled
      />
      <TextInput label="Total" value={totalsState.total.toString()} disabled />
      <TextInput
        label="Total Tax"
        value={totalsState.totalTax.toString()}
        disabled
      />
      <SectionedMultiSelect
        items={flatProducts}
        onSelectedItemsChange={(selectedItems) => {
          setSelectedProducts(selectedItems);
        }}
        // @ts-ignore
        IconRenderer={Icon}
        uniqueKey="title"
        displayKey="title"
        selectedItems={selectedProducts}
        selectText="Select products"
        searchPlaceholderText="Search products"
        showDropDowns={true}
        showCheckbox={true}
        colors={{
          primary: theme.colors.primary,
        }}
        noResultsComponent={<Text>No products found</Text>}
      />
      <Button
        mode="contained"
        onPress={() => {
          handleSubmit();
          setCustomerName("");
          setCustomerEmail("");
          setSelectedProducts([]);
          dispatch({ type: TotalsActionType.SET_SUBTOTAL, payload: 0 });
          Toast.show({
            type: "info",
            text1: "Quote creation started",
            visibilityTime: 3000,
          });
        }}
        disabled={
          customerName === "" ||
          customerEmail === "" ||
          selectedProducts.length === 0
        }
      >
        Submit quote
      </Button>
    </View>
  );
}
