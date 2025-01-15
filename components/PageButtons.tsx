import { ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

interface PageButtonsProps {
  pages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

const PageButtons: React.FC<PageButtonsProps> = (props) => {
  const theme = useTheme();
  const buttons = [];
  for (let index = 1; props.pages && index <= props.pages; index++) {
    buttons.push(
      <View
        key={index}
        style={{
          marginHorizontal: 5,
          marginVertical: 10,
          padding: 5,
          borderWidth: 1,
          borderRadius: 50,
          width: 40,
          height: 40,
          backgroundColor:
            props.currentPage === index ? theme.colors.primary : "white",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text
          style={{ textAlign: "center" }}
          onPress={() => props.onPageSelect(index)}
        >
          {index}
        </Text>
      </View>
    );
  }
  return (
    <ScrollView
      horizontal
      style={{ marginVertical: 10, marginHorizontal: 5 }}
      showsHorizontalScrollIndicator={false}
    >
      {buttons}
    </ScrollView>
  );
};

export default PageButtons;
