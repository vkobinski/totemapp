import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  Button,
  TouchableHighlight,
  RefreshControl,
  TouchableOpacity,
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
import { useFocusEffect } from "@react-navigation/native";

export function Calendario(props) {
  const setCadastrar = props["setCadastrar"];

  logo = require("../../../assets/logo.png");
const setaEsquerda = require("../../../assets/seta-esquerda.png");
const setaDireita = require("../../../assets/seta-direita.png");

  const [days, setDays] = useState([]);
  const [hours, setHours] = useState([]);
  const [serverGet, setServerGet] = useState(false);
  const [from, setFrom] = useState(moment().add(1, "days").toDate());
  const [till, setTill] = useState(moment().add(8, "days").toDate());
  const [renderViews, setRenderViews] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isGettingApiDays, setIsGettingApiDays] = useState(false);

  const generateHours = React.useCallback(() => {
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
  }, []);

  const diminuirSemana = () => {
    setTill(moment(from).toDate());
    setFrom(moment(from).subtract(7, "days").toDate());
    setServerGet(false);
  };

  const aumentarSemana = () => {
    setFrom(moment(till).toDate());
    setTill(moment(till).add(7, "days").toDate());
    setServerGet(false);
  };

  const generateDays = React.useCallback(async () => {

    if (hours.length <= 0) return;

    let cur = moment(from);
    let to = moment(till);
    const newDays = [];

    do {
      if (cur.day() == 0) {
        cur = cur.add(1, "days");
        to = to.add(1, "days");
        continue;
      }

      let newDay = {
        date: cur.toDate(),
        hoursMarked: [],
      };

      for (let x = 0; x < hours.length; x++) {
        newDay.hoursMarked.push(false);
      }

      newDays.push(newDay);

      cur = cur.add(1, "days");
    } while (cur.date() !== to.date());

    setDays(newDays);
  }, [hours, till]);

  useEffect(() => {
    generateHours();
  }, []);

  useEffect(() => {
    generateDays();
  }, [hours, till]);

  useEffect(() => {
      getApiDays();
  }, [days]);

  useFocusEffect(
    React.useCallback(() => {
      setServerGet(false);
      setFrom(moment().add(1, "days").toDate());
      setTill(moment().add(8, "days").toDate());

      return () => {};
    }, [])
  );

  const renderDays = React.useCallback(() => {
    let cur = moment(from);
    let to = moment(till);

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

      cur = cur.add(1, "days");
    } while (cur.date() !== to.date());

    setRenderViews( {
      views: views,
      days: daysViews,
    });
  }, [days, hours]);

  useEffect(() => {
    renderDays();
  }, [days]);

  const salvarHorarios = React.useCallback(async () => {
    const sendValue = [];

    for (let j = 0; j < days.length; j++) {
      const dia = days[j].date;

      const currentDayVal = [];

      for (let index = 0; index < days[j].hoursMarked.length; index++) {
        const horario = days[j].hoursMarked[index];
        const horarioValor = hours[index];

        if (horario && currentDayVal.length == 0)
          currentDayVal.push(horarioValor);
        else if (!horario && days[j].hoursMarked[index - 1])
          currentDayVal.push(hours[index - 1]);
        else if (horario && !days[j].hoursMarked[index - 1])
          currentDayVal.push(hours[index]);
        else if (horario && index == days[j].hoursMarked.length - 1)
          currentDayVal.push(hours[index]);
      }

      var day = dia.getDate();
      var month = dia.getMonth() + 1;
      var year = dia.getFullYear();
      var formattedDate = `${day}/${month}/${year}`;

      if (currentDayVal.length > 0)
        sendValue.push({ dia: formattedDate, horarios: currentDayVal });
      else sendValue.push({ dia: formattedDate, horarios: [] });
    }

    const user = await AsyncStorage.getItem("user");

    await axios
      .post(utils.getData("/api/v1/disponibilidade/" + user), sendValue)
      .then((response) => {
        processApiDays(response.data);
      });
  }, [days, hours]);

  const getByDate = React.useCallback((date) => {
    for (let i = 0; i < days.length; i++) {
      if (moment(days[i].date).date() == moment(date).date()) return i;
    }

    return -1;
  }, [days]);

  const formatDate = (date) => {
    var day = moment(date).date();
    var month = moment(date).month() + 1;
    var year = moment(date).year();
    return `${day}/${month}/${year}`;
  };

  const getApiDays = React.useCallback(async () => {
    const dayList = [];
    if (serverGet) return;
    if (refreshing) return;
    if (isGettingApiDays) return; 
  
    days.forEach((d) => dayList.push(formatDate(d.date)));
    if (dayList.length <= 0) return;
  
    setRefreshing(true);
    setIsGettingApiDays(true); 
  
    const user = await AsyncStorage.getItem("user");
    await axios
      .post(utils.getData("/api/v1/disponibilidade/getList/" + user), dayList)
      .then((response) => {
        processApiDays(response.data);
      })
      .finally(() => {
        setIsGettingApiDays(false);
      });
  
    setServerGet(true);
    setRefreshing(false);
  }, [days, isGettingApiDays]);

  const isTimeBetween = (startH, startM, endH, endM, target, day) => {

    console.log("here: " + day);

    console.log("Is time between: ", moment(day).date());
    console.log("Is time between: ", target);

    const startDate = moment(day).hours(startH).minutes(startM);

    const targetDate = moment(day).hours(target.split(":")[0]).minutes(target.split(":")[1]);

    const endDate = moment(day).hours(endH).minutes(endM);

    return startDate <= targetDate && targetDate <= endDate;
  };

  const getAllMarkedFalse = React.useCallback(() => {
    const marked = [...days[0].hoursMarked];
    let newDays = [...days];

    for (let i = 0; i < marked.length; i++) marked[i] = false;
    for (let i = 0; i < days.length; i++) newDays[i].hoursMarked = [...marked];

    return newDays;
  }, [days]);

  const processApiDays = React.useCallback((data) => {
    let newDays = getAllMarkedFalse();
    
    console.log(data.length);
    console.log("days: " , days);
    console.log("data: " , data);

    for(let array_size = 0; array_size <  data.length; array_size++ ) {
      console.log("array_size " + array_size);
      const element = data[array_size];
      const diaApiAtual = moment(element["dia"]);

      const pos = getByDate(diaApiAtual);

      console.log("DIA ATUAL API: ", diaApiAtual, " pos:" , pos);

      if(pos == -1) continue;

      const marked = [...days[pos].hoursMarked];
      console.log("MARKED: " + marked.length + " pos " + pos);

      for (let i = 0; i < marked.length; i++) {
        const execute = isTimeBetween(
            element["horaInicio"],
            element["minutoInicio"],
            element["horaFim"],
            element["minutoFim"],
            hours[i],
            diaApiAtual
          );
        if (
          execute
        ) {
          if (element["atendimento"]) marked[i] = "atendimento";
          else marked[i] = true;
        }
      }

      newDays[pos].hoursMarked = marked;
    }

    setDays(newDays);
  }, [days]);

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>

      <View style={styles.containerCentral}>
        <View style={styles.botoesTitulo}>
          <TouchableOpacity
            style={styles.botoesSeta}
            onPress={diminuirSemana}
            disabled={refreshing}
          >
            <Image style={styles.botoesImagem} source={setaEsquerda} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botoesSeta}
            onPress={aumentarSemana}
            disabled={refreshing}
          >
            <Image style={styles.botoesImagem} source={setaDireita} />
          </TouchableOpacity>
        </View>

        <View style={{ ...styles.daysContainer, backgroundColor: "#f2f2f2" }}>
          {renderViews !== null ? renderViews.views : <></>}
        </View>
        <ScrollView style={styles.scroll}
        >
          <View style={styles.daysContainer}>
            {renderViews !== null ? renderViews.days : <></>}
          </View>
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
  botoesTitulo: {
    flexDirection: "row",
    height: 50,
    width: "100%",
    justifyContent: "space-between",
  },

  botoesImagem: {
    marginHorizontal: 10,
    width: 40,
    height: 40,
    resizeMode: "contain",
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
    //fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  containerCentral: {
    alignItems: "center",
    top: 180,
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
    //fontFamily: "Inter_700Bold",
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
