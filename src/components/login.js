import axios from "axios";
import { StyleSheet, View, Text, TextInput, Button, Image } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function Login(props) {
  const { setLoggedIn, setUserId, password, setPassword, email, setEmail } =
    props;

  const [showError, setShowError] = useState(false);

  logo = require("../../assets/logo.png");

  useEffect(() => {
    const loadData = async () => {
      try {
        const value = await AsyncStorage.getItem("user");
        if (value !== null) {
          setUserId(value);
          setLoggedIn(true);
        }
      } catch (e) {}
    };

    loadData();
  }, []);

  const saveUser = async (data) => {
    await AsyncStorage.setItem("user", data.toString());
  };

  const onLogin = () => {
    axios
      .postForm("http://192.168.2.101:8080/api/v1/usuario/login", {
        senha: password,
        email: email,
      })
      .then(async (response) => {
        if (response.status === 401) {
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
        } else {
          try {
            saveUser(response.data["idUsuario"]);
            setUserId(response.data["idUsuario"]);
            setLoggedIn(true);
          } catch (e) {
            console.log(e);
          }
        }
      })
      .catch((error) => {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.titulo}>Login</Text>
        <View style={styles.labeledInput}>
          <TextInput
            style={[styles.textInput, styles.text]}
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.text}>E-mail</Text>
        </View>
        <View style={styles.labeledInput}>
          <TextInput
            style={[styles.textInput, styles.text]}
            value={password}
            onChangeText={setPassword}
          />
          <Text style={styles.text}>Senha</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            color={"#4C042C"}
            style={styles.button}
            title="Entrar"
            onPress={onLogin}
          />
        </View>

        {showError && (
          <View style={styles.spanContainer}>
            <Text style={styles.spanText}>Email ou senha errados!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5E4B56",
    alignSelf: "center",
  },
  imagem: {
    height: "30%",
    width: "30%",
    position: "relative",
    alignSelf: "center",
    top: 160,
  },
  circle: {
    position: "absolute",
    top: -35,
    alignSelf: "center",
    height: "35%",
    width: "140%",
    borderBottomLeftRadius: 350,
    borderBottomRightRadius: 350,
    overflow: "hidden",
    backgroundColor: "#4C042C",
  },
  formContainer: {
    marginTop: 100,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
  labeledInput: {
    flexDirection: "column",
    justifyContent: "flex-start",
    height: 90,
    width: "100%",
    alignItems: "center",
  },
  textInput: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    height: 25,
    width: 250,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  buttonContainer: {
    width: 250,
    borderRadius: 5,
    justifyContent: "center",
    alignSelf: "center",
  },
  button: {
    width: "100%",
  },
  spanContainer: {
    justifyContent: "center",
    alignSelf: "center",
  },
  spanText: {
    marginTop: 15,
    fontSize: 19,
  },
});
