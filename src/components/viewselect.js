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
import { SafeAreaProvider } from "react-native-safe-area-context";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Inter_700Bold } from "@expo-google-fonts/inter";
import { BlurView } from "@react-native-community/blur";

export function MainView(props) {
  const userId = props["userId"];
  const deslogFunction = props["deslogFunction"];
  const setCadastrar = props["setCadastrar"];

  let [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const deslogar = () => {
    AsyncStorage.removeItem("user");
    deslogFunction();
  };

  const deslogarImagem = require("../../assets/deslogar.png");
  const addUser = require("../../assets/add-user.png");

  const { lastJsonMessage, sendMessage } = useWebSocket(
    "ws://192.168.2.101:8080/websocket-endpoint",
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
      reconnectInterval: 100,
      reconnectAttempts: 20000,
    }
  );

  const [atendimentos, setAtendimentos] = useState([]);
  const [notificacao, setNotificacao] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageToShow, setImageToShow] = useState(null);

  const fetchAtendimentos = () => {
    axios
      .get("http://192.168.2.101:8080/api/v1/atendimento/" + userId)
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

          return {
            ...atendimento,
            dataAtendimento: formattedTime,
            fotoPaciente:
              atendimento.fotoPaciente === null
                ? null
                : `data:image/jpeg;base64,${atendimento.fotoPaciente}`,
          };
        });

        setAtendimentos(atendimentosAntes);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  async function displayNotification(nome, horario) {
    if (Platform.OS === "ios") {
      await notifee.requestPermission();
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

  useEffect(() => {
    fetchAtendimentos();
  }, []);

  const verPaciente = (novaImagem) => {
    setShowImage(true);
    setImageToShow(novaImagem);
  };

  const pararVerPaciente = (novaImagem) => {
    setShowImage(false);
    setShowImage(novaImagem);
  };

  return (
    <SafeAreaProvider>
      {showImage === true ? (
        <>
          <Image style={styles.pacienteImagem} source={imageToShow} />
          <BlurView style={styles.blur} blurType="light" />
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
        <Text style={[styles.texto, { fontFamily: "Inter_700Bold" }]}>
          Atendimentos Hoje
        </Text>
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
        <TouchableHighlight style={styles.botoesInferiores} onPress={() => setCadastrar(true)}>
          <Image style={styles.imagemCadastrar} source={addUser} />
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
  texto: {
    top: 30,
    alignSelf: "center",
    fontSize: 19,
    color: "#5E4B56",
  },
  imagemDeslogar: {
    tintColor: "#5E4B56",
    width: 40,
    height: 40,
  },
  imagemCadastrar: {
    tintColor: "#5E4B56",
    width: 50,
    height: 40,

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
    backgroundColor: "#4C042C",
  },
  scrollview: {
    top: 200,
    maxHeight: 525,
  },
  botoesInferiores: {
    width: 30,
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
  pacienteImagem: {
    borderRadius: 200,
    height: 320,
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
