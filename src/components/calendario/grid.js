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
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import utils from "../../singletons/Utils";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { useEffect } from "react";
import React from "react";
import moment from "moment";
import Dia from "./Dia";
import WeekDay from "./week-day";

export function Calendario(props) {
  const setCadastrar = props["setCadastrar"];

  const [nome, setNome] = useState("");

  const setaEsquerda = require("../../../assets/seta-esquerda.png");

  logo = require("../../../assets/logo.png");

  const [from] = React.useState(moment().subtract(2, "days").toDate());
  const [till] = React.useState(moment().add(2, "days").toDate());

  const renderDays = () => {
    let cur = from;

    const views = [];
    let i = 1;

    do {
      views.push(<WeekDay key={i} item={{title: "teste"}} />);
      i++;

      cur.setDate(cur.getDate() + 1);
    } while(cur.getDay() !== till.getDay() )

    return views;
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>

      <View style={styles.containerCentral}>

        <ScrollView style={styles.scroll}>{renderDays()}</ScrollView>
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
    backgroundColor: "black",
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
  autoComplete: {
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
    backgroundColor: "blue",
    width: 500,
  },
});
