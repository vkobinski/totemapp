import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DayHeader } from "./header";

export default function WeekDay(props) {
  const { item } = props;
  if (item.day === undefined) return;

  const days = item.days;
  const dayIndex = item.dayIndex;
  const setDays = item.setDays;

  const markDay = (index) => {
    console.log(index);
    let newDays = [...days];

    console.log(dayIndex);

    newDays[dayIndex].hoursMarked[index] =
      !newDays[dayIndex].hoursMarked[index];

    setDays(newDays);
  };

  const renderDays = () => {
    const views = [];

    for (let i = 0; i < item.day.hours.length; i++) {
      views.push(
        <TouchableOpacity key={i} onPress={() => markDay(i)}>
          <Text
            style={{
              ...styles.texto,
              backgroundColor:
                item.day.hoursMarked[i] == true ? "#DDFCCE" : "transparent",
            }}
          >
            {item.day.hours[i]}
          </Text>
        </TouchableOpacity>
      );
    }

    return views;
  };

  return <View style={styles.container}>{renderDays()}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    flexDirection: "column",
    alignItems: "center",
  },
  texto: {
    fontSize: 16,
    color: "#0095FF",
    marginVertical: 10,
    borderRadius: 4,
    padding: 2,
  },
});
