import { StatusBar } from "expo-status-bar";
import { MainView } from "./src/components/viewselect";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { Login } from "./src/components/login";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const renderContent = () => {
    if (loggedIn) {
      return <MainView userId={userId} />;
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
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
