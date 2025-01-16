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
import { Button, Snackbar, TextInput, useTheme } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";

export default function CreateQuotes() {
  const queryClient = useQueryClient();

  const theme = useTheme();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showSnack, setShowSnack] = useState<boolean>(false);
  const { dispatch, state: totalsState } = useCalculateTotals();
  const { createQuote } = useQuotes();
  const { fetchProducts } = useProducts();

  const { mutate: quoteMutate, isError, isPending, isSuccess } = createQuote();

  console.log("CreateQuote", isError, isPending, isSuccess);

  // Product data should already be fetched at this point.
  // TODO If not, we need to refetch the product data at this place.
  // TODO Show proper error message in case of offline.
  // TODO we need a callback for onSuccess
  let products: ProductResponse = queryClient.getQueryData(["products"]) ?? {
    pageParams: [],
    pages: [],
  };

  if (products.pages.length === 0) {
    fetchProducts();
  }

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

  useEffect(() => {
    if (isError !== isSuccess) {
      setShowSnack(true);
    }
  }, [isError, isSuccess]);

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
    quoteMutate({quote: {
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
    }, handleOnSuccess: () => {}  );
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
        colors={{
          primary: theme.colors.primary,
        }}
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
      <Snackbar
        visible={showSnack}
        onDismiss={() => setShowSnack(false)}
        duration={1500}
      >
        {isSuccess ? "Quote created successfully" : "Quote failed to create"}
      </Snackbar>
    </View>
  );
}
