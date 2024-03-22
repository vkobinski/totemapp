import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
//import { Inter_700Bold, useFonts } from "expo-font";

export function DayHeader(props) {
  const { item } = props;
  if (item.day === undefined) return;

//let [fontsLoaded] = useFonts({
    //Inter_700Bold,
  //});

  const [days, setInsideDays] = useState();
  const [dayIndex, setDayIndex] = useState();
  const [dayString, setDayString] = useState("");
  const [diaArray, setDiaArray] = useState([]);
  const [diaAtual, setDiaAtual] = useState("");

  useEffect(() => {
    setInsideDays(item.days);
    setDayIndex(item.dayIndex);
    setDayString(item.day.date.toDateString());

    setDiaArray(dayString.split(" "));

  }, []);

  useEffect(() => {
    setDiaAtual(`${diaArray[2]} de ${getMonth(diaArray[1])}`);

  }, [diaArray]);

  const setDays = item.setDays;

    const markDay = async () => {
    let newDays = [...days];

    let trueCount = 0;

    for (let x = 0; x < newDays[dayIndex].hoursMarked.length; x++) {
      if(newDays[dayIndex].hoursMarked[x]) trueCount++;
    }

    for (let x = 0; x < newDays[dayIndex].hoursMarked.length; x++) {
        if(trueCount > 15) newDays[dayIndex].hoursMarked[x] = false;
        else newDays[dayIndex].hoursMarked[x] = true;
    }

    setDays(newDays);
  };

  return (
    <TouchableHighlight style={styles.container} onPress={markDay}>
      <>
        <Text style={{ ...styles.texto, fontSize: 16 }}>
          {getDayOfWeek(dayString.split(" ")[0])}
        </Text>
        <Text style={styles.texto}>{diaAtual}</Text>
      </>
    </TouchableHighlight>
  );
}

function getDayOfWeek(day) {
  switch (day) {
    case "Mon":
      return "Seg";
    case "Tue":
      return "Ter";
    case "Wed":
      return "Qua";
    case "Thu":
      return "Qui";
    case "Fri":
      return "Sex";
    case "Sat":
      return "Sáb";
    case "Sun":
      return "Dom";
  };
}

function getMonth(month) {
  switch (month) {
    case "Jan":
      return "Jan";
    case "Feb":
      return "Fev";
    case "Mar":
      return "Mar";
    case "Apr":
      return "Abr";
    case "Jun":
      return "Jun";
    case "Jul":
      return "Jul";
    case "May":
      return "Mai";
    case "Aug":
      return "Ago";
    case "Sep":
      return "Set";
    case "Oct":
      return "Out";
    case "Nov":
      return "Nov";
    case "Dec":
      return "Dez";
  };
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    backgroundColor: "#f2f2f2",
    display: "flex",
    alignItems: "center",
  },
  texto: {
    //fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: "#0095FF",
  },
});
