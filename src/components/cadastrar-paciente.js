import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  Button,
  TouchableHighlight,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Inter_500Medium, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import utils from "../singletons/Utils";

export function CadastrarPaciente(props) {
  const setCadastrar = props["setCadastrarPaciente"];

  let [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
  });

  const buttonGreen = "#00A701";
  const buttonRed = "#D00D0B";

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openHour, setOpenHour] = useState(false);
  const [textoBotao, setTextoBotao] = useState("");
  const [buttonColor, setButtonColor] = useState(buttonRed);

  const getNascimentoFormatado = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  };

  const cadastraAgendamento = async () => {
    axios
      .postForm(utils.getData("/api/v1/paciente/form"), {
        nomeCompleto: nome.trim(),
        dataNascimento: getNascimentoFormatado(dataNascimento),
      })
      .then((response) => {
        if (response.status === 404) {
          setButtonColor(buttonRed);
          setTextoBotao("Não foi possível cadastrar o paciente");
        }
        else {
          setButtonColor(buttonGreen);
          setTextoBotao("Paciente cadastrado com sucesso!");
        }
      })
      .catch((error) => {
        setButtonColor(buttonRed);
        setTextoBotao("Erro ao Cadastrar!");
      });
  };

  const setaEsquerda = require("../../assets/seta-esquerda.png");

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>

      <View style={styles.containerCentral}>
        <Text style={styles.titulo}>Novo Paciente</Text>

        <View style={styles.formContainer}>
          <View style={styles.labeledInput}>
            <TextInput
              style={[styles.textInput, styles.text]}
              value={nome}
              onChangeText={setNome}
            />
            <Text style={styles.label}>Nome</Text>
          </View>

          <View style={styles.labeledInput}>
            <TextInput
              style={[styles.textInput, styles.text]}
              onTouchStart={() => setOpenDate(true)}
              value={getNascimentoFormatado(dataNascimento)}
            />
            <Text style={styles.label}>Data de Nascimento</Text>
          </View>
          <View style={styles.labeledInput}>
            <DatePicker
              modal
              mode="date"
              locale="pt-BR"
            title={"Selecionar Data"}
              open={openDate}
              date={dataNascimento}
              onConfirm={(data) => {
                setOpenDate(false);
                setDataNascimento(data);
              }}
              onCancel={() => {
                setOpenDate(false);
              }}
 confirmText="Confirmar"
            cancelText="Cancelar"
 
            />

            <View style={styles.buttonContainer}>
              <Button
                color={"#088cf4"}
                style={styles.button}
                title="Cadastrar"
                onPress={cadastraAgendamento}
              />
            </View>

            <Text style={[styles.span, { color: buttonColor }]}>
              {textoBotao}
            </Text>
          </View>
        </View>
      </View>
      {/* <View style={styles.containerBotoesInferiores}>
        <TouchableHighlight
          style={styles.botoesInferiores}
          onPress={() => setCadastrar(false)}
        >
          <Image style={styles.imagemDeslogar} source={setaEsquerda} />
        </TouchableHighlight>
      </View> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
  imagemDeslogar: {
    tintColor: "#088cf4",
    width: 40,
    height: 50,
  },
  botoesInferiores: {
    width: 40,
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
  titulo: {
    color: "#088cf4",
    fontSize: 19,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  containerCentral: {
    alignItems: "center",
    top: 200,
    width: "100%",
    alignSelf: "center",
  },
  imagem: {
    height: 140,
    width: 140,
    position: "relative",
    alignSelf: "center",
    top: 230,
  },
  labeledInput: {
    flexDirection: "column",
    justifyContent: "flex-start",
    height: 90,
    width: "100%",
    alignItems: "center",
  },
  formContainer: {
    marginTop: 150,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
  textInput: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    height: 25,
    width: 250,
  },
  buttonContainer: {
    width: 250,
    borderRadius: 5,
    marginTop: 25,
    justifyContent: "center",
    alignSelf: "center",
  },
  button: {
    width: "100%",
  },
  span: {
    top: 150,
    fontFamily: "Inter_700Bold",
    position: "absolute",
    fontSize: 17,
    marginTop: 40,
  },
});
