import InputComponent from "@/components/InputComponent";
import { Product, ProductResponse, QuoteRequest, QuoteStatus } from "@/types";
import { validateEmail } from "@/utils/stringUtils";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { nanoid } from "nanoid/non-secure"; // Only works with non-secure nanoid.
import React, { useState } from "react";
import { View } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import SectionedMultiSelect from "react-native-sectioned-multi-select";

export default function CreateQuotes() {
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [subtotal, setSubtotal] = useState<string>("0");
  const [total, setTotal] = useState<string>("0");
  const [totalTax, setTotalTax] = useState<string>("0");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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
    mutationFn: async (quote: QuoteRequest) => {
      console.log("Triggering mutation");
      return fetch(`${hostname}/api/collections/quotes/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quote),
      })
        .then((res) => res.json())
        .catch((err) => console.log(err));
    },
    onMutate: async (payload: QuoteRequest) => {
      await queryClient.cancelQueries();
      updateLocalQuoteList(payload.id, true);
    },
    onSuccess: (quote) => {
      console.log("Success");
      updateLocalQuoteList(quote.id, false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleSubmit = () => {
    if (
      customerName === "" ||
      customerEmail === "" ||
      selectedProducts.length === 0
    ) {
      return;
    }
    createMutation.mutate({
      id: nanoid(15), // Need to be 15 chars long.
      customer_info: {
        name: customerName,
        email: customerEmail,
      },
      items: selectedProducts.map((product) => {
        const productItem = flatProducts.find(
          (p: Product) => p.title === product
        );
        return {
          product_name: productItem?.title,
          price: productItem?.price,
          quantity: 1,
          subtotal: productItem?.price,
        };
      }),
      status: QuoteStatus.DRAFT,
      subtotal: 25,
      total: 28,
      total_tax: 2,
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
        value={customerEmail}
        onChangeText={(email) => {
          setCustomerEmail(email);
        }}
        error={customerEmail === "" || validateEmail(customerEmail)}
      />

      <TextInput
        label="Subtotal"
        keyboardType="numeric"
        value={subtotal}
        onChangeText={(subtotal) => {
          setSubtotal(subtotal);
        }}
        error={subtotal === "" || Number(subtotal) <= 0}
      />
      <TextInput
        label="Total"
        keyboardType="numeric"
        value={total}
        onChangeText={(total) => {
          setTotal(total);
        }}
        error={total === "" || Number(total) <= 0}
      />
      <TextInput
        label="Total Tax"
        keyboardType="numeric"
        value={totalTax}
        onChangeText={(totalTax) => {
          setTotalTax(totalTax);
        }}
        error={totalTax === "" || Number(totalTax) <= 0}
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
        styles={{ container: { borderColor: "black", borderWidth: 1 } }}
      />
      <Button
        mode="contained"
        onPress={() => {
          handleSubmit();
        }}
        disabled={
          customerName === "" ||
          customerEmail === "" ||
          selectedProducts.length === 0 ||
          subtotal === "" ||
          Number(subtotal) <= 0 ||
          total === "" ||
          Number(total) <= 0 ||
          totalTax === "" ||
          Number(totalTax) <= 0
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
