import { Text, View } from "react-native";

interface LabeledTextProps {
  label: string;
  text: string;
}

const LabeledText: React.FC<LabeledTextProps> = (props: LabeledTextProps) => {
  return (
    <View style={{ flexDirection: "row" }}>
      <Text style={{ fontWeight: "bold" }}>{props.label}</Text>
      <Text>{props.text}</Text>
    </View>
  );
};

export default LabeledText;
