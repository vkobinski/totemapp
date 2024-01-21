import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight,
} from "react-native";
import React, { useState } from "react";

export function DayHeader(props) {
  const { item } = props;
  if (item.day === undefined) return;

  const days = item.days;
  const dayIndex = item.dayIndex;
  const setDays = item.setDays;
  const [initialBool, setInitialBool] = useState(true);

  const markDay = () => {
    let newDays = [...days];

    for (let x = 0; x < newDays[dayIndex].hoursMarked.length; x++) {
      newDays[dayIndex].hoursMarked[x] = initialBool;
    }

    setInitialBool(!initialBool);

    setDays(newDays);
  };

  const dayString = item.day.date.toDateString();

  const diaArray = dayString.split(" ");
  const diaAtual = `${diaArray[2]} of ${diaArray[1]}`;

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
    fontSize: 9,
    color: "#0095FF",
  },
});
