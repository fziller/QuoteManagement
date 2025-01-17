import InputComponent from "@/components/InputComponent";
import useCalculateTotals, {
  TotalsActionType,
} from "@/hooks/useCalculateTotals";
import useProducts from "@/hooks/useProducts";
import useQuotes from "@/hooks/useQuotes";
import { Product, QuoteStatus } from "@/types";
import { validateEmail } from "@/utils/stringUtils";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { nanoid } from "nanoid/non-secure"; // Only works with non-secure nanoid.
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import Toast from "react-native-toast-message";

export default function CreateQuotes() {
  const theme = useTheme();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { dispatch, state: totalsState } = useCalculateTotals();
  const { createQuote } = useQuotes();
  const { getPrefetchedProducts } = useProducts();

  const { mutate: quoteMutate } = createQuote();

  // Product data should already be fetched at this point.
  // TODO Make sure that data is being fetched and view rerender when application is started offline for the very first time
  // and no product cache was set at all.
  const products = getPrefetchedProducts();

  useEffect(() => {
    const subtotal = selectedProducts.reduce((acc, product) => {
      return acc + Number(products.find((p) => p.title === product)?.price);
    }, 0);

    dispatch({ type: TotalsActionType.SET_SUBTOTAL, payload: subtotal });
  }, [selectedProducts]);

  const handleSubmit = () => {
    // Create list of all items, which were previously selected.
    const items = selectedProducts.map((product) => {
      const productItem = products.find((p: Product) => p.title === product);
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
        created: new Date().toISOString(),
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
    <ScrollView style={{ margin: 10 }}>
      <View style={{ gap: 10 }}>
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
        <TextInput
          label="Total"
          value={totalsState.total.toString()}
          disabled
        />
        <TextInput
          label="Total Tax"
          value={totalsState.totalTax.toString()}
          disabled
        />
        <SectionedMultiSelect
          items={products}
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
    </ScrollView>
  );
}
