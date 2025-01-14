import { Quote } from "@/types";
import { Text, View } from "react-native";
import { Card, Divider } from "react-native-paper";

const QuoteCard: React.FC<Quote> = (quote: Quote) => {
  return (
    <Card
      style={{
        backgroundColor: "white",
        minWidth: "95%",
        marginVertical: 5,
      }}
    >
      <Card.Title
        title={quote.customer_info?.name}
        subtitle={quote.customer_info?.email}
        right={() => (
          <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
            <Text style={{ fontWeight: "bold", marginEnd: 20 }}>
              {quote.status}
            </Text>
            <Text style={{ marginEnd: 20, marginTop: 10 }}>
              {`${new Date(quote.valid_until).toDateString()}`}
            </Text>
          </View>
        )}
        style={{
          marginStart: 5,
        }}
      />
      <Card.Content>
        <Divider style={{ marginHorizontal: 5, marginVertical: 5 }} />
        {quote.items.map((item) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 5,
            }}
          >
            <Text>{item.product_name}</Text>
            <Text>{`${item.price}€`}</Text>
          </View>
        ))}
        <Divider style={{ marginHorizontal: 5, marginVertical: 5 }} />
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 5,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Total:</Text>
            <Text>{`${Math.round(quote.total * 100) / 100}€`}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default QuoteCard;
