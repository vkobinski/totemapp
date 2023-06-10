import { StyleSheet, View, RefreshControl, ScrollView, StatusBar } from "react-native";
import { Atendimento } from "./atendimento.js";
import useWebSocket from "react-use-websocket";
import { useEffect, useState } from "react";
import axios from "axios";
import { SafeAreaProvider } from "react-native-safe-area-context";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { Platform } from "react-native";

export function MainView(props) {

  const userId = props;

  const { lastJsonMessage, sendMessage } = useWebSocket(
    "ws://192.168.2.101:8080/websocket-endpoint",
    {
      onOpen: () => sendMessage("1"),
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

  const fetchAtendimentos = () => {
    console.log(userId['userId']);
    axios
      .get("http://192.168.2.101:8080/api/v1/atendimento/" + userId['userId'])
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
              if (atendimentos[i]["chegou"] !== atendimento["chegou"]) {
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

  return (
    <SafeAreaProvider>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAtendimentos()}
          />
        }
      >
        <View style={styles.container}>
          {atendimentos.map((atendimento, index) => (
            <Atendimento
              key={index}
              paciente={atendimento["paciente"]["nomeCompleto"]}
              chegou={atendimento["chegou"]}
              horario={atendimento["dataAtendimento"]}
            />
          ))}
        </View>
      </ScrollView>
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
  title: {
    color: "white",
    fontWeight: "bold",
  },
});
