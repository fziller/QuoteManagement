import { TextInput } from "react-native-paper";

interface TextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error: boolean;
}

const InputComponent: React.FC<TextInputProps> = (props) => {
  return (
    <TextInput
      label={props.label}
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={(text) => {
        props.onChangeText(text);
      }}
      error={props.error}
    />
  );
};

export default InputComponent;
