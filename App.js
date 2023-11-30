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
import * as Device from 'expo-device';

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

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const deslogFunction = () => {
    setLoggedIn(false);
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });


    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const renderContent = () => {
    if (loggedIn && !cadastrar && !cadastrarPaciente) {
      return (
        <MainView
          userId={userId}
          deslogFunction={deslogFunction}
          setCadastrar={setCadastrar}
          setCadastrarPaciente={setCadastrarPaciente}
        />
      );
    } else if (loggedIn && cadastrarPaciente) {
      return <CadastrarPaciente setCadastrarPaciente={setCadastrarPaciente} />;
    } else if (loggedIn && cadastrar) {
      return <Cadastrar setCadastrar={setCadastrar} />;
    } else {
      return (
        <Login
          setLoggedIn={setLoggedIn}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          email={email}
          setEmail={setEmail}
          token={expoPushToken}
        />
      );
    }
  };

  return (
    <AutocompleteDropdownContextProvider>
      <View style={styles.container}>
        {renderContent()}
        <StatusBar />
      </View>
    </AutocompleteDropdownContextProvider>
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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({ 
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token.data;
}