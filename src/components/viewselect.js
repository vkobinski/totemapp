import {
  StyleSheet,
  View,
  RefreshControl,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { Atendimento } from "./atendimento.js";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { SafeAreaProvider } from "react-native-safe-area-context";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Inter_700Bold } from "@expo-google-fonts/inter";
import DatePicker from "react-native-date-picker";
import { BlurView } from "@react-native-community/blur";
import utils from "../singletons/Utils.js";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { useFocusEffect } from "@react-navigation/native";

export function MainView({route}) {
  const {userId} = route.params;
  //const deslogFunction = props["deslogFunction"];
  //const setCadastrar = props["setCadastrar"];
  //const setCadastrarPaciente = props["setCadastrarPaciente"];

  let [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const deslogar = () => {
    AsyncStorage.removeItem("user");
    deslogFunction();
  };

  const logo = require("../../assets/logo.png");

  const deslogarImagem = require("../../assets/deslogar.png");
  const addUser = require("../../assets/cadastro.png");
  const cadastrarPacienteImagem = require("../../assets/add-user.png");
  const setaEsquerda = require("../../assets/seta-esquerda.png");
  const setaDireita = require("../../assets/seta-direita.png");

  const [atendimentos, setAtendimentos] = useState([]);
  //const [notificacao, setNotificacao] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);
  const [openDate, setOpenDate] = useState(false);
  const [dayToShow, setDayToShow] = useState(new Date());
  const [swipe, setSwipe] = useState('');

  //const checkSendNotification = () => {
  //  axios
  //    .postForm(utils.getData("/api/v1/atendimento/search-by-day"), {
  //      userId: userId,
  //      day: getDayToShow(),
  //    })
  //    .then((response) => {
  //      response.data.map((atendimento) => {
  //        for (let i = 0; i < atendimentos.length; i++) {
  //          if (
  //            atendimentos[i]["atendimentoId"] === atendimento["atendimentoId"]
  //          ) {
  //            if (
  //              atendimentos[i]["chegou"] !== atendimento["chegou"] &&
  //              atendimento["chegou"] === true
  //            ) {
  //              displayNotification(
  //                atendimento["paciente"]["nomeCompleto"],
  //                formattedTime
  //              );
  //            }
  //          }
  //        }
  //      });
  //    })
  //    .catch((error) => {
  //      console.error("Error:", error);
  //    });
  //};

  const fetchAtendimentos = () => {
    setRefreshing(true);
    axios
      .postForm(utils.getData("/api/v1/atendimento/search-by-day"), {
        userId: userId,
        day: getDayToShow(),
      })
      .then((response) => {
        const atendimentosAntes = response.data.map((atendimento) => {
          const dateTime = new Date(atendimento.dataAtendimento);
          const formattedTime = dateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          //for (let i = 0; i < atendimentos.length; i++) {
          //  if (
          //    atendimentos[i]["atendimentoId"] === atendimento["atendimentoId"]
          //  ) {
          //    if (
          //      atendimentos[i]["chegou"] !== atendimento["chegou"] &&
          //      atendimento["chegou"] === true
          //    ) {
          //      displayNotification(
          //        atendimento["paciente"]["nomeCompleto"],
          //        formattedTime
          //      );
          //    }
          //  }
          //}

          const foto =
            atendimento.fotoPaciente === null
              ? null
              : `data:image/jpeg;base64,${atendimento.fotoPaciente}`;

          delete atendimento["fotoPaciente"];

          return {
            ...atendimento,
            fotoPaciente: foto,
            dataAtendimento: formattedTime,
          };
        });

        setAtendimentos(atendimentosAntes);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const pedePermissao = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if(status === "denied") 
      alert("As notificações estão desligadas pois foram recusadas quando o aplicativo abriu a primeira vez! Para ativá-las vá para as configurações ou reinstale o aplicativo.")
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAtendimentos();

      return () => {
  
      };
    }, [])
  );



  useEffect(() => {

    pedePermissao();
  }, []);

  const aumentarDia = async () => {
    dataMostrar = new Date(dayToShow);
    dataMostrar.setDate(dayToShow.getDate() + 1);
    setDayToShow(dataMostrar);
  };

  const diminuirDia = async () => {
    dataMostrar = new Date(dayToShow);
    dataMostrar.setDate(dayToShow.getDate() - 1);
    setDayToShow(dataMostrar);
  };

  useEffect(() => {
    fetchAtendimentos();
  }, [dayToShow]);

  async function displayNotification(nome, horario) {
    if (Platform.OS === "ios") {
      await notifee.requestPermission();

      await notifee.displayNotification({
        id: toString(notificacao),
        title: "Paciente Chegou!",
        body: `Paciente ${nome} chegou para o atendimento de ${horario}.`,
      });

      setNotificacao(notificacao + 1);
      return;
    }

    const channelId = await notifee.createChannel({
      id: "Atendimento",
      name: " atendimentos",
      vibration: true,
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      id: toString(notificacao),
      title: "Paciente Chegou!",
      body: `Paciente <strong>${nome}</strong> chegou para o atendimento de ${horario}.`,
      android: { channelId },
    });

    setNotificacao(notificacao + 1);
  }


  const verPaciente = (novaImagem) => {
    setShowImage(true);
    setImageToShow(novaImagem);
  };

  const pararVerPaciente = (novaImagem) => {
    setShowImage(false);
    setShowImage(novaImagem);
  };

  const getDayToShow = () => {
    let mm = dayToShow.getMonth() + 1; // Months start at 0!
    let dd = dayToShow.getDate();
    let year = dayToShow.getFullYear();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    return dd + "/" + mm + "/" + year;
  };

  const user = require("../../assets/user.png");


  return (
    <SafeAreaProvider>
      {showImage === true ? (
        <>
          <Image style={styles.pacienteImagem} source={imageToShow} />
          <BlurView
            style={styles.blur}
            blurType="light"
            onTouchStart={() => pararVerPaciente(user)}
          />
        </>
      ) : null}
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAtendimentos()}
          />
        }
        style={styles.scrollview}
      >

        <View style={styles.botoesTitulo}>
          <TouchableOpacity
            style={styles.botoesSeta}
            onPress={diminuirDia}
            disabled={refreshing}
          >
            <Image style={styles.botoesImagem} source={setaEsquerda} />
          </TouchableOpacity>
          <Text
            style={[styles.texto, { fontFamily: "Inter_700Bold" }]}
            onPress={() => setOpenDate(true)}
          >
            Atendimentos {getDayToShow().substring(0, 5)}
          </Text>
          <TouchableOpacity
            style={styles.botoesSeta}
            onPress={aumentarDia}
            disabled={refreshing}
          >
            <Image style={styles.botoesImagem} source={setaDireita} />
          </TouchableOpacity>
          <DatePicker
            modal
            mode="date"
            locale="pt-BR"
            title={"Selecionar Data"}
            open={openDate}
            date={dayToShow}
            onConfirm={(data) => {
              setOpenDate(false);
              setDayToShow(data);
            }}
            onCancel={() => {
              setOpenDate(false);
            }}
            confirmText="Confirmar"
            cancelText="Cancelar"
          />
        </View>
        <View style={styles.container}>
          {atendimentos.map((atendimento, index) => (
            <Atendimento
              key={index}
              paciente={atendimento["paciente"]["nomeCompleto"]}
              fotoPaciente={atendimento["fotoPaciente"]}
              chegou={atendimento["chegou"]}
              verPaciente={verPaciente}
              pararVerPaciente={pararVerPaciente}
              horario={atendimento["dataAtendimento"]}
            />
          ))}
        </View>
      </ScrollView>
      {/* <View style={styles.containerBotoesInferiores}> */}
        {/* <TouchableOpacity style={styles.botoesInferiores} onPress={deslogar}> */}
          {/* <Image style={styles.imagemDeslogar} source={deslogarImagem} /> */}
        {/* </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.botoesInferiores} onPress={() => setCadastrar(true)}> */}
          {/* <Image style={styles.imagemCadastrar} source={addUser} /> */}
        {/* </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.botoesInferiores} onPress={() => setCadastrarPaciente(true)} > */}
          {/* <Image style={styles.imagemCadastrarPaciente} source={cadastrarPacienteImagem} /> */}
        {/* </TouchableOpacity> */}
      {/* </View> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  botoesTitulo: {
    flexDirection: "row",
    alignSelf: "auto",
    height: 40,
    justifyContent: "space-around",
  },
  botoesSeta: {
  },
  botoesImagem: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  texto: {
    alignSelf: "center",
    fontSize: 19,
    color: "#0095FF",
  },
  imagemDeslogar: {
    width: 60,
    height: 50,
    tintColor: "#ffb40c",
  },
  imagemCadastrar: {
    width: 60,
    height: 50,
    tintColor: "#ffb40c",
  },
  imagemCadastrarPaciente: {
    width: 60,
    height: 50,
    tintColor: "#ffb40c",
  },
  title: {
    color: "white",
    fontWeight: "bold",
  },
  imagem: {
    height: 140,
    width: 140,
    position: "relative",
    alignSelf: "center",
    top: 230,
  },
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

  scrollview: {
    top: 200,
    maxHeight: 525,
  },
  botoesInferiores: {
    width: 60,
    height: 50,
  },
  containerBotoesInferiores: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    bottom: 0,
    paddingLeft: 30,
    paddingRight: 30,
    marginBottom: 32,
    height: 40,
  },
  pacienteImagem: {
    borderRadius: 200,
    height: 340,
    width: 340,
    position: "absolute",
    alignSelf: "center",
    top: 261,
    zIndex: 3,
  },
  blur: {
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 2,
  },
});
