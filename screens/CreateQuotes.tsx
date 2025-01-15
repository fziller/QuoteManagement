import ActivityIndicatorModal from "@/components/ActivityIndicatorModal";
import InputComponent from "@/components/InputComponent";
import useCalculateTotals, {
  TotalsActionType,
} from "@/hooks/useCalculateTotals";
import useProducts from "@/hooks/useProducts";
import useQuotes from "@/hooks/useQuotes";
import { Product, ProductResponse, QuoteRequest, QuoteStatus } from "@/types";
import { validateEmail } from "@/utils/stringUtils";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid/non-secure"; // Only works with non-secure nanoid.
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";

export default function CreateQuotes() {
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { dispatch, state: totalsState } = useCalculateTotals();
  const { createQuote } = useQuotes();
  const { fetchProducts } = useProducts();

  const { mutate: quoteMutate, isError, isPending, isSuccess } = createQuote();

  console.log("CreateQuote", isError, isPending, isSuccess);

  // Product data should already be fetched at this point.
  const products: ProductResponse = queryClient.getQueryData(["products"]) ?? {
    pageParams: [],
    pages: [],
  };

  if (products.pages.length === 0) {
    fetchProducts();
  }

  console.log("Products", products);

  const flatProducts: Product[] = products.pages
    .map((productResponse) => {
      return productResponse.items;
    })
    .flat();

  useEffect(() => {
    const subtotal = selectedProducts.reduce((acc, product) => {
      return acc + Number(flatProducts.find((p) => p.title === product)?.price);
    }, 0);

    dispatch({ type: TotalsActionType.SET_SUBTOTAL, payload: subtotal });
  }, [selectedProducts]);

  const handleSubmit = () => {
    // Sum of all product prices
    const subtotal = selectedProducts.reduce(
      (acc, product) =>
        acc + Number(flatProducts.find((p) => p.title === product)?.price),
      0
    );

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
    } as QuoteRequest);
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
        error={customerEmail === "" || validateEmail(customerEmail)}
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
      />
      <Button
        mode="contained"
        onPress={() => {
          handleSubmit();
        }}
        disabled={
          customerName === "" ||
          customerEmail === "" ||
          selectedProducts.length === 0
        }
      >
        Submit quote
      </Button>
      <ActivityIndicatorModal isLoading={isPending} />
      {/* <Snackbar
        visible={createMutation.isSuccess}
        onDismiss={() => createMutation.reset()}
        duration={1500}
      >
        {createMutation.isSuccess
          ? "Quote created successfully"
          : "Quote failed to create"}
      </Snackbar> */}
    </View>
  );
}
