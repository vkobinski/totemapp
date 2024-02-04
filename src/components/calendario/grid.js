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
import React, { useEffect, useState } from "react";
import moment, { utc } from "moment";
import WeekDay from "./week-day";
import { DayHeader } from "./header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import utils from "../../singletons/Utils";

export function Calendario(props) {
  const setCadastrar = props["setCadastrar"];

  logo = require("../../../assets/logo.png");

  const [days, setDays] = useState([]);
  const [hours, setHours] = useState([]);

  const [from] = React.useState(moment().add(1, "days").toDate());
  const [till] = React.useState(moment().add(8, "days").toDate());

  const generateHours = () => {
    const startTime = 7 * 60;
    const endTime = 21 * 60;
    const interval = 30;

    const newHours = [];

    for (let minutes = startTime; minutes < endTime; minutes += interval) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      newHours.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }

    setHours(newHours);
  };

  const generateDays = () => {
    if (hours.length <= 0) return;

    let cur = from;
    const newDays = [];

    do {
      let newDay = {
        date: cur,
        hoursMarked: [],
      };

      for (let x = 0; x < hours.length; x++) {
        newDay.hoursMarked.push(false);
      }

      newDays.push(newDay);

      cur = moment(cur).add(1, "days").toDate();
    } while (cur.getDay() !== till.getDay());

    setDays(newDays);
  };

  useEffect(() => {
    generateHours();
  }, []);

  useEffect(() => {
    generateDays();
  }, [hours]);
  const renderDays = () => {
    let cur = from;

    const views = [];
    const daysViews = [];
    let i = 1;

    do {
      views.push(
        <DayHeader
          key={i}
          item={{
            day: days[i - 1],
            setDays: setDays,
            days: days,
            dayIndex: i - 1,
          }}
        />
      );
      daysViews.push(
        <WeekDay
          key={i}
          item={{
            day: days[i - 1],
            setDays: setDays,
            days: days,
            hours: hours,
            dayIndex: i - 1,
          }}
        />
      );
      i++;

      cur = moment(cur).add(1, "days").toDate();
    } while (cur.getDay() !== till.getDay());

    return {
      views: views,
      days: daysViews,
    };
  };

  const renderViews = renderDays();

  const salvarHorarios = async () => {
    const sendValue = [];

    for (let j = 0; j < days.length; j++) {

      const dia = days[j].date;

      const currentDayVal = [];

      for (let index = 0; index < days[j].hoursMarked.length; index++) {
        const horario = days[j].hoursMarked[index];
        const horarioValor = hours[index];
        
        if(horario && currentDayVal.length == 0) currentDayVal.push(horarioValor);
        else if(!horario && days[j].hoursMarked[index-1]) currentDayVal.push(hours[index-1]);
        else if(horario && !days[j].hoursMarked[index-1]) currentDayVal.push(hours[index]);
        else if(horario && index == days[j].hoursMarked.length-1) currentDayVal.push(hours[index]);
      }



      var day = dia.getDate();
      var month = dia.getMonth() + 1;
      var year = dia.getFullYear();
      var formattedDate = `${day}/${month}/${year}`;

      if(currentDayVal.length > 0) sendValue.push({ "dia": formattedDate, "horarios": currentDayVal });
    }

    console.log(sendValue);

    const user = await AsyncStorage.getItem("user");

    await axios.post(utils.getData("/api/v1/disponibilidade/" + user), sendValue).then((response) => {
      console.log(response);
    });

  };

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

        <TouchableHighlight
          style={styles.buttonContainer}
          onPress={salvarHorarios}
        >
          <Text style={styles.button}>Salvar</Text>
        </TouchableHighlight>
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
    width: 150,
    height: 30,
    borderRadius: 5,
    marginTop: 20,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#088cf4",
  },
  button: {
    fontSize: 17,
    width: "100%",
    color: "white",
    textAlign: "center",
    fontFamily: "Inter_700Bold",
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
