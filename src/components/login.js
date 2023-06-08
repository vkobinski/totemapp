import axios from "axios";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export function Login(props) {

  const {setLoggedIn, setUserId, password, setPassword, email, setEmail} = props;

  const onLogin = () => {
    axios.postForm("http://192.168.2.101:8080/api/v1/usuario/login", {
      "senha": password,
      "email": email,
    }).then((response) => {
      if(response.status === 401) console.log("UNAUTHORIZED");
      else {
        setUserId(response.data['idUsuario']);
        setLoggedIn(true);
      }
    });
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.labeledInput}>
        <Text style={styles.text}>Email:</Text>
        <TextInput
          style={[styles.textInput, styles.text]}
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.labeledInput}>
        <Text style={styles.text}>Senha:</Text>
        <TextInput
          style={[styles.textInput, styles.text]}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.containerbutton}>
        <Button style={styles.button} title="Login" onPress={onLogin}></Button>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    width: "100%",
  },
  containerbutton: {
    width: "50%",
    justifyContent: 'center',
    alignSelf: 'center',
  },
  button: {
  },
  labeledInput: {
    flexDirection: "row",
    justifyContent: "flex-start",
    height: 80,
    width: "100%",
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  textInput: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    height: 25,
    width: 250,
    marginLeft: 50,
  },
  text: {
    fontSize: 16,
  },
});
