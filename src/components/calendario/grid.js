import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  Button,
  TouchableHighlight,
  ScrollView,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import React, { useEffect, useState } from "react";
import moment from "moment";
import Dia from "./Dia";
import WeekDay from "./week-day";
import { DayHeader } from "./header";
import { render } from "react-dom";

export function Calendario(props) {
  const setCadastrar = props["setCadastrar"];

  logo = require("../../../assets/logo.png");

  const [days, setDays] = useState([]);

  const [from] = React.useState(moment().add(1, "days").toDate());
  const [till] = React.useState(moment().add(8, "days").toDate());

  useEffect(() => {
    let cur = from;
    const newDays = [];

    do {
      let newDay = {
        date: cur,
        hours: [],
        hoursMarked: [],
      };

      const startTime = 7 * 60;
      const endTime = 21 * 60;
      const interval = 30;

      for (let minutes = startTime; minutes < endTime; minutes += interval) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        newDay.hours.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        );
        newDay.hoursMarked.push(false);
      }

      newDays.push(newDay);

      cur = moment(cur).add(1, "days").toDate();
    } while (cur.getDay() !== till.getDay());

    setDays(newDays);
  }, []);

  const renderDays = () => {
    let cur = from;

    const views = [];
    const daysViews = [];
    let i = 1;

    do {
      views.push(<DayHeader key={i} item={{ day: days[i - 1], setDays: setDays, days: days, dayIndex: i-1 }} />);
      daysViews.push(<WeekDay key={i} item={{ day: days[i - 1], setDays: setDays, days: days, dayIndex: i-1}} />);
      i++;

      cur = moment(cur).add(1, "days").toDate();
    } while (cur.getDay() !== till.getDay());

    return {
      views: views,
      days: daysViews,
    };
  };

  const renderViews = renderDays();

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>

      <View style={styles.containerCentral}>
        <View style={{ ...styles.daysContainer, backgroundColor: "#f2f2f2" }}>
          {renderViews.views}
        </View>
        <ScrollView style={styles.scroll}>
          <View style={styles.daysContainer}>{renderViews.days}</View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    top: -200,
    alignSelf: "center",
    height: 375,
    width: 700,
    borderBottomLeftRadius: 400,
    borderBottomRightRadius: 400,
    overflow: "hidden",
    backgroundColor: "#088cf4",
  },
  imagemDeslogar: {
    tintColor: "#5E4B56",
    width: 40,
    height: 50,
  },
  botoesInferiores: {
    width: 40,
    height: 50,
  },
  containerBotoesInferiores: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    bottom: 0,
    marginBottom: 32,
    marginLeft: 40,
    marginRight: 40,
    height: 40,
  },
  titulo: {
    fontSize: 19,
    color: "#5E4B56",
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  containerCentral: {
    alignItems: "center",
    top: 200,
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    height: 480,
    alignSelf: "center",
  },
  imagem: {
    height: 140,
    width: 140,
    position: "relative",
    alignSelf: "center",
    top: 230,
  },
  labeledInput: {
    flexDirection: "column",
    justifyContent: "flex-start",
    height: 90,
    width: "100%",
    alignItems: "center",
  },
  formContainer: {
    marginTop: 150,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
  textInput: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    height: 25,
    width: 250,
  },
  buttonContainer: {
    width: 250,
    borderRadius: 5,
    marginTop: 25,
    justifyContent: "center",
    alignSelf: "center",
  },
  button: {
    width: "100%",
  },
  span: {
    fontSize: 17,
    marginTop: 20,
  },
  scroll: {
    width: 380,
  },
  daysContainer: {
    padding: 10,
    width: "100%",
    alignContent: "center",
    display: "flex",
    flexDirection: "row",
    //backgroundColor: "#f2f2f2",
    justifyContent: "center",
  },
});
