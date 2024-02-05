import { StatusBar } from "expo-status-bar";
import { MainView } from "./src/components/viewselect";
import { View, StyleSheet, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import { Login } from "./src/components/login";
import { Cadastrar } from "./src/components/cadastrar";
import { CadastrarPaciente } from "./src/components/cadastrar-paciente";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Calendario } from "./src/components/calendario/grid";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const usePushNotifications = Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [cadastrar, setCadastrar] = useState(false);
  const [cadastrarPaciente, setCadastrarPaciente] = useState(false);
  const [finalStatus, setFinalStatus] = useState();

  const mostrarCalendario = true;

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const Tab = createBottomTabNavigator();

  const deslogFunction = async () => {
    setLoggedIn(false);

    await AsyncStorage.removeItem("user");
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const renderContent = () => {
    //return (
    //<Calendario>

    //</Calendario>
    //);

    if (!loggedIn) {
      return (
        <Login
          setLoggedIn={setLoggedIn}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          email={email}
          setEmail={setEmail}
          token={expoPushToken}
          setToken={setExpoPushToken}
        />
      );
    } else {
      return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Consultas">
            {() => <MainView deslogFunction={deslogFunction} userId={userId} />}
          </Tab.Screen>
          <Tab.Screen name="Paciente" component={CadastrarPaciente} />
          <Tab.Screen name="Agendar" component={Cadastrar} />
          {mostrarCalendario && (
            <Tab.Screen name="Calendário" component={Calendario} />
          )}
        </Tab.Navigator>
      );
    }

    if (loggedIn && !cadastrar && !cadastrarPaciente) {
      return (
        <MainView
          userId={userId}
          deslogFunction={deslogFunction}
          setCadastrar={setCadastrar}
          setCadastrarPaciente={setCadastrarPaciente}
        />
      );
    }
  };

  const normalTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      background: "transparent",
    },
  };

  return (
    <>
      <NavigationContainer theme={normalTheme}>
        <AutocompleteDropdownContextProvider>
          <View style={styles.container}>
            {renderContent()}
            <StatusBar />
          </View>
        </AutocompleteDropdownContextProvider>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    console.log(existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Não foi possível conseguir permissões!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    return token.data;
  } else {
    return null;
  }
}
