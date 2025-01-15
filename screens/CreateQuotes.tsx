import QuoteStatusDropdown from "@/components/QuoteStatusDropdown";
import { Quote, QuoteRequest, QuoteStatus } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid/non-secure"; // Only works with non-secure nanoid.
import { useRef } from "react";
import { View } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";

export default function CreateQuotes() {
  const hostname = "https://feasible-amoeba-profound.ngrok-free.app";

  const queryClient = useQueryClient();

  const nameRef = useRef<string>(undefined);
  const emailRef = useRef<string>(undefined);
  const statusRef = useRef<QuoteStatus>(QuoteStatus.DRAFT);
  const subtotalRef = useRef<string>(undefined);
  const totalRef = useRef<string>(undefined);
  const totalTaxRef = useRef<string>(undefined);

  console.log({ current: nameRef.current });

  const updateLocalQuoteList = (id: string, isNotSynced?: boolean) => {
    queryClient.setQueryData<Quote[]>(["quotes"], (quotes) => {
      return quotes?.map((quote) => {
        if (quote.id === id) {
          return { ...quote, isNotSynced };
        }
        return quote;
      });
    });
  };

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
    onMutate: async (payload: Quote) => {
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

  return (
    <View style={{ gap: 10, marginHorizontal: 10, marginTop: 10 }}>
      <TextInput
        label="Customer name"
        placeholder="Enter name of customer ..."
        value={nameRef.current}
        onChangeText={(name) => {
          nameRef.current = name;
        }}
      />
      <TextInput
        label="Customer email"
        placeholder="Enter email of customer ..."
        value={emailRef.current}
        onChangeText={(email) => {
          emailRef.current = email;
        }}
      />

      <TextInput
        label="Subtotal"
        keyboardType="numeric"
        value={subtotalRef.current}
        onChangeText={(subtotal) => {
          subtotalRef.current = subtotal;
        }}
      />
      <TextInput
        label="Total"
        keyboardType="numeric"
        value={totalRef.current}
        onChangeText={(total) => {
          totalRef.current = total;
        }}
      />
      <TextInput
        label="Total Tax"
        keyboardType="numeric"
        value={totalTaxRef.current}
        onChangeText={(totalTax) => {
          totalTaxRef.current = totalTax;
        }}
      />
      <QuoteStatusDropdown
        onSelect={(selectedItem) => {
          statusRef.current = selectedItem;
        }}
        label="Select quote status"
        button={<TextInput label="Quote status" editable={false} />}
      />

      <Button
        mode="contained"
        onPress={() =>
          createMutation.mutate({
            id: nanoid(15), // Need to be 15 chars long.
            customer_info: {
              name: nameRef.current,
              email: emailRef.current,
            },
            items: [
              {
                product_name: "test",
                quantity: 1,
                price: 1,
                subtotal: 1,
              },
            ],
            status: statusRef.current,
            subtotal: 25,
            total: 28,
            total_tax: 2,
          } as Quote)
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
