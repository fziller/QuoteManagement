import { Text, View } from "react-native";

interface StatusComponentProps {
  text: string;
}

const StatusComponent: React.FC<StatusComponentProps> = (props) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 10,
    }}
  >
    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 20 }}>
      {props.text}
    </Text>
  </View>
);

export default StatusComponent;
