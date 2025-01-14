import { QuoteStatus } from "@/types";
import { Text, View } from "react-native";
import { Divider } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";

interface QuoteStatusDropdownProps {
  onSelect: (selectedItem: QuoteStatus) => void;
}

const QuoteStatusDropdown: React.FC<QuoteStatusDropdownProps> = (props) => {
  return (
    <SelectDropdown
      data={[
        QuoteStatus.DRAFT,
        QuoteStatus.PENDING,
        QuoteStatus.REJECTED,
        QuoteStatus.ACCEPTED,
        QuoteStatus.SENT,
        QuoteStatus.EXPIRED,
      ]}
      onSelect={(selectedItem) => {
        props.onSelect(selectedItem);
      }}
      renderButton={() => (
        <View
          style={{
            marginVertical: 10,
            marginHorizontal: 5,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Filter by status</Text>
        </View>
      )}
      renderItem={(selectedItem, index, isSelected) => {
        return (
          <View>
            <Text
              style={{
                fontWeight: `${isSelected ? "bold" : "normal"}`,
                marginVertical: 10,
                marginHorizontal: 10,
              }}
            >
              {selectedItem}
            </Text>
            <Divider style={{ marginHorizontal: 5 }} />
          </View>
        );
      }}
    />
  );
};

export default QuoteStatusDropdown;
