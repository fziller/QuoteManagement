import { Modal, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

interface ActivityIndicatorModalProps {
  isLoading: boolean;
}

// A close button for the component might come in handy in case something breaks.
const ActivityIndicatorModal: React.FC<ActivityIndicatorModalProps> = (
  props
) => (
  <Modal
    visible={props.isLoading}
    transparent
    children={
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <ActivityIndicator size="large" animating />
      </View>
    }
  />
);

export default ActivityIndicatorModal;
