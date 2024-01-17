import { View, Text } from "react-native";

export default function WeekDay(props) {
  const { item } = props;

  const tocar = () => {};

  return (
    <View
      style={{
        borderRadius: 10,
        elevation: 5,
        margin: 10,
        paddingLeft: 50,
      }}
      onTouchStart={tocar}
    >
      <Text style={{ color: "black" }}>{item.title}</Text>
    </View>
  );
}
