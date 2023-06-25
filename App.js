import { StatusBar } from "expo-status-bar";
import { MainView } from "./src/components/viewselect";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { Login } from "./src/components/login";
import { Cadastrar } from "./src/components/cadastrar";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [cadastrar, setCadastrar] = useState(false);

  const deslogFunction = () => {
    setLoggedIn(false);
  }

  const renderContent = () => {
    if (loggedIn && !cadastrar) {
      return <MainView userId={userId} deslogFunction={deslogFunction} setCadastrar={setCadastrar}/>;
    } else if(loggedIn && cadastrar) {
      return <Cadastrar setCadastrar={setCadastrar} />
    } else {
      return (
        <Login
          setLoggedIn={setLoggedIn}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          email={email}
          setEmail={setEmail}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <StatusBar  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
