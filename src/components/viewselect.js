import {
  StyleSheet,
  View,
  RefreshControl,
  ScrollView,
  StatusBar,
  Image,
  Text,
  TouchableHighlight,
} from "react-native";
import { Atendimento } from "./atendimento.js";
import useWebSocket from "react-use-websocket";
import { useEffect, useState } from "react";
import axios from "axios";
import BackgroundService from "react-native-background-actions";
import { SafeAreaProvider } from "react-native-safe-area-context";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Inter_700Bold } from "@expo-google-fonts/inter";
import DatePicker from "react-native-date-picker";
import { BlurView } from "@react-native-community/blur";
import utils from "../singletons/Utils.js";

export function MainView(props) {
  const userId = props["userId"];
  const deslogFunction = props["deslogFunction"];
  const setCadastrar = props["setCadastrar"];
  const setCadastrarPaciente = props["setCadastrarPaciente"];

  let [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const deslogar = () => {
    AsyncStorage.removeItem("user");
    deslogFunction();
  };

  const deslogarImagem = require("../../assets/deslogar.png");
  const addUser = require("../../assets/cadastro.png");
  const cadastrarPacienteImagem = require("../../assets/add-user.png");
  const setaEsquerda = require("../../assets/seta-esquerda-2.png");
  const setaDireita = require("../../assets/seta-direita.png");

  const [atendimentos, setAtendimentos] = useState([]);
  const [notificacao, setNotificacao] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);
  const [openDate, setOpenDate] = useState(false);
  const [dayToShow, setDayToShow] = useState(new Date());

  const checkSendNotification = () => {
    axios
      .postForm(utils.getData("/api/v1/atendimento/search-by-day"), {
        userId: userId,
        day: getDayToShow(),
      })
      .then((response) => {
        response.data.map((atendimento) => {
          for (let i = 0; i < atendimentos.length; i++) {
            if (
              atendimentos[i]["atendimentoId"] === atendimento["atendimentoId"]
            ) {
              if (
                atendimentos[i]["chegou"] !== atendimento["chegou"] &&
                atendimento["chegou"] === true
              ) {
                displayNotification(
                  atendimento["paciente"]["nomeCompleto"],
                  formattedTime
                );
              }
            }
          }
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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

          for (let i = 0; i < atendimentos.length; i++) {
            if (
              atendimentos[i]["atendimentoId"] === atendimento["atendimentoId"]
            ) {
              if (
                atendimentos[i]["chegou"] !== atendimento["chegou"] &&
                atendimento["chegou"] === true
              ) {
                displayNotification(
                  atendimento["paciente"]["nomeCompleto"],
                  formattedTime
                );
              }
            }
          }

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

  const checkNotified = () => {
    axios
      .postForm(utils.getData("/api/v1/atendimento/not-notified"), {
        userId: userId,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data == "S") checkSendNotification();
      });
  };

  const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

  const veryIntensiveTask = async () => {
    await new Promise(async (resolve) => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        checkNotified();
        await sleep(10000);
      }
    });
  };

  const options = {
    taskName: "Procurando por novos pacientes",
    taskTitle: "Pacientes",
    taskDesc: "Checando se novos pacientes chegaram",
    taskIcon: {
      name: "ic_launcher",
      type: "mipmap",
    },
    color: "#ff00ff",
    parameters: {
      delay: 10000,
    },
  };

  useEffect(() => {
    async function startBackground() {
      await BackgroundService.start(veryIntensiveTask, options);
    }

    startBackground();
  }, []);

  const { lastJsonMessage, sendMessage } = useWebSocket(
    utils.getDataWs("/websocket-endpoint"),
    {
      onOpen: () => {
        sendMessage("1");
        fetchAtendimentos();
      },
      onMessage: (message) => {
        if (message.data === "S") fetchAtendimentos();
      },
      onError: (event) => {
        console.error(event);
      },
      shouldReconnect: (closeEvent) => true,
      reconnectInterval: 1000,
      reconnectAttempts: 20000,
    }
  );

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

  useEffect(() => {
    return notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log(detail);
      }
    });
  }, []);

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

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    return dd + "/" + mm;
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
          <TouchableHighlight
            style={styles.botoesSeta}
            onPress={diminuirDia}
            disabled={refreshing}
          >
            <Image styles={styles.botoesImagem} source={setaEsquerda} />
          </TouchableHighlight>
          <Text
            style={[styles.texto, { fontFamily: "Inter_700Bold" }]}
            onPress={() => setOpenDate(true)}
          >
            Atendimentos {getDayToShow()}
          </Text>
          <TouchableHighlight
            style={styles.botoesSeta}
            onPress={aumentarDia}
            disabled={refreshing}
          >
            <Image styles={styles.botoesImagem} source={setaDireita} />
          </TouchableHighlight>
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
      <View style={styles.containerBotoesInferiores}>
        <TouchableHighlight style={styles.botoesInferiores} onPress={deslogar}>
          <Image style={styles.imagemDeslogar} source={deslogarImagem} />
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.botoesInferiores}
          onPress={() => setCadastrar(true)}
        >
          <Image style={styles.imagemCadastrar} source={addUser} />
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.botoesInferiores}
          onPress={() => setCadastrarPaciente(true)}
        >
          <Image
            style={styles.imagemCadastrarPaciente}
            source={cadastrarPacienteImagem}
          />
        </TouchableHighlight>
      </View>
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
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
  },
  botoesSeta: {
    height: 60,
    width: 60,
    margin: 10,
  },
  botoesImagem: {
    height: 40,
    width: 40,
    tintColor: "#0864ac",
  },
  texto: {
    alignSelf: "center",
    fontSize: 19,
    color: "#0864ac",
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
    backgroundColor: "#0864ac",
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
    height: 310,
    width: 324,
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
