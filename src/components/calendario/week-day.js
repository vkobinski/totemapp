import { View, Text, StyleSheet, TouchableOpacity, TouchableHighlight } from "react-native";
import { DayHeader } from "./header";
import { useState } from "react";
//import { useFonts, Inter_400Regular } from "expo-font";

export default function WeekDay(props) {
  const { item } = props;
  if (item.day === undefined) return;


//let [fontsLoaded] = useFonts({
    //Inter_400Regular,
  //});

  const days = item.days;
  const dayIndex = item.dayIndex;
  const setDays = item.setDays;
  const hours = item.hours;

  const markDay = async (index) => {
    let newDays = [...days];

    newDays[dayIndex].hoursMarked[index] =
      !newDays[dayIndex].hoursMarked[index];

    setDays(newDays);
  };

  const desmarkHour = async (index) => {
    let newDays = [...days];

    let trueCount = 0;

    for(let x = 0; x < 7; x++) {
      if(newDays[x].hoursMarked[index]) trueCount++;
    }

    for (let x = 0; x < 7; x++) {
      if(trueCount > 4) newDays[x].hoursMarked[index] = false;
      else newDays[x].hoursMarked[index] = true;
    }

    setDays(newDays);


  };

  const getColor = (value) => {

    if(value == true) return "#FCCECE";
    if(value == "atendimento") return "#FFF1A6";

    return "transparent";

  };

  const renderDays = () => {
    const views = [];

    for (let i = 0; i < hours.length; i++) {
      views.push(
        <TouchableHighlight key={i} onPress={() => markDay(i)} onLongPress={() => desmarkHour(i)}>
          <Text
            style={{
              ...styles.texto,
              backgroundColor:
                getColor(item.day.hoursMarked[i])
            }}
          >
            {hours[i]}
          </Text>
        </TouchableHighlight>
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
    //fontFamily: "Inter_400Regular",
  },
});
