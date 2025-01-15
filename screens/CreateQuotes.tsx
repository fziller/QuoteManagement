import InputComponent from "@/components/InputComponent";
import useCalculateTotals, {
  TotalsActionType,
} from "@/hooks/useCalculateTotals";
import { Product, ProductResponse, QuoteRequest, QuoteStatus } from "@/types";
import { validateEmail } from "@/utils/stringUtils";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { nanoid } from "nanoid/non-secure"; // Only works with non-secure nanoid.
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";

export default function CreateQuotes() {
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { dispatch, state: totalsState } = useCalculateTotals();

  const hostname = Constants.expoConfig?.extra?.HOSTNAME;

  // TODO The values need validation

  const updateLocalQuoteList = (id: string, isNotSynced?: boolean) => {
    queryClient.setQueryData<QuoteRequest[]>(["quotes"], (quotes) => {
      return quotes?.map((quote) => {
        if (quote.id === id) {
          return { ...quote, isNotSynced };
        }
        return quote;
      });
    });
  };

  const products: ProductResponse = queryClient.getQueryData(["products"]) ?? {
    pageParams: [],
    pages: [],
  };

  const flatProducts: Product[] = products.pages
    .map((productResponse) => {
      return productResponse.items;
    })
    .flat();

  // TODO let mutation fail and check error. Check offline case.
  const createMutation = useMutation({
    mutationKey: ["create-quotes"],
    mutationFn: async (quote: QuoteRequest) =>
      fetch(`${hostname}/api/collections/quotes/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quote),
      })
        .then((res) => res.json())
        .catch((err) => console.log(err)),

    onMutate: async (payload: QuoteRequest) => {
      await queryClient.cancelQueries();
      updateLocalQuoteList(payload.id, true);
    },
    onSuccess: (quote) => {
      console.log("CreateMutation", "Success");
      updateLocalQuoteList(quote.id, false);
    },
    onError: (error) => {
      console.log("CreateMutation", error);
    },
  });

  useEffect(() => {
    const subtotal = selectedProducts.reduce((acc, product) => {
      console.log("calculateTotals", {
        acc,
        price: Number(flatProducts.find((p) => p.title === product)?.price),
      });
      return acc + Number(flatProducts.find((p) => p.title === product)?.price);
    }, 0);

    dispatch({ type: TotalsActionType.SET_SUBTOTAL, payload: subtotal });
  }, [selectedProducts]);

  console.log({ totalsState });

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
    createMutation.mutate({
      id: nanoid(15), // Need to be 15 chars long.
      customer_info: {
        name: customerName,
        email: customerEmail,
      },
      items,
      // Set to DRAFT as we might need validation in backend or send products before wrapping it up.
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
      <Snackbar
        visible={createMutation.isSuccess}
        onDismiss={() => createMutation.reset()}
        duration={1500}
      >
        {createMutation.isSuccess
          ? "Quote created successfully"
          : "Quote failed to create"}
      </Snackbar>
    </View>
  );
}
