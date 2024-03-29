import {
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  Button,
  TouchableHighlight,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import React, { useRef, useState } from "react";
import DatePicker from "react-native-date-picker";
import axios, { HttpStatusCode } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import utils from "../singletons/Utils";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function Cadastrar(props) {
  let [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const buttonGreen = "#00A701";
  const buttonRed = "#D00D0B";

  const logo = require("../../assets/logo.png");

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [dataNascimentoPaciente, setDataNascimentoPaciente] = useState(
    new Date()
  );
  const [horarioConsulta, setHorarioConsulta] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openHour, setOpenHour] = useState(false);
  const [textoBotao, setTextoBotao] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [buttonColor, setButtonColor] = useState(buttonRed);
  const [showAutoComplete, setShowAutoComplete] = useState(true);

  let counter = 0;

  useEffect(() => {
    axios.get(utils.getData("/api/v1/paciente/ativo")).then((response) => {
      let pacientesTemp = [];
      response.data.forEach((paciente) => {
        paciente = {
          id: counter,
          title:
            paciente["nomeCompleto"] +
            " " +
            convertDate(response.data[counter]["dataNascimento"]),
          dataNascimento: convertDate(paciente["dataNascimento"]),
          nomeCompleto: paciente["nomeCompleto"],
        };

        counter++;
        pacientesTemp.push(paciente);
      });

      setPacientes(pacientesTemp);
    });
  }, []);

  const formataPacientes = () => {
    if (pacientes.length > 0) {
      setPacientes((prevPacientes) => {
        return prevPacientes.map((paciente) => {
          paciente["title"] =
            paciente["nomeCompleto"] +
            " " +
            convertDate(paciente["dataNascimento"]);

          return paciente;
        });
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setTextoBotao("");
      setSelectedItem(null);
      setShowAutoComplete(true);
      setHorarioConsulta(new Date());
      setDataNascimento(new Date());

      return () => {
        setShowAutoComplete(false);
        formataPacientes();
      };
    }, [pacientes])
  );

  const convertDate = (inputFormat) => {
    var datePart = inputFormat.match(/\d+/g),
      year = datePart[0], // get only two digits
      month = datePart[1],
      day = datePart[2];

    return day + "/" + month + "/" + year;
  };

  const getNascimentoFormatado = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  };

  const getHorarioFormatado = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const cadastraAgendamento = async () => {
    if (selectedItem == null) {
      setTextoBotao("Selecione um paciente");
      setButtonColor(buttonRed);
      return;
    }

    await axios
      .postForm(utils.getData("/api/v1/atendimento/app/form"), {
        userId: await AsyncStorage.getItem("user"),
        nomePaciente: selectedItem["nomeCompleto"],
        dataNascimento: selectedItem["dataNascimento"],
        dataHora:
          getNascimentoFormatado(dataNascimento) +
          " " +
          getHorarioFormatado(horarioConsulta),
      })
      .then((response) => {
        if (
          response.status == HttpStatusCode.BadRequest &&
          response.data.contains("detail")
        ) {
          if (response.data["detail"] == "ocupado") {
          }
        }
        if (response.status === 404) {
          setTextoBotao("Paciente não encontrado");
          setButtonColor(buttonRed);
        } else {
          setButtonColor(buttonGreen);
          setTextoBotao("Sucesso!");
        }
      })
      .catch((error) => {
        if (error.response.status == 400)
          setTextoBotao("Horário está ocupado!");
        else 
          setTextoBotao("Erro ao Cadastrar!");

        setButtonColor(buttonRed);
      });
  };

  const changeItem = (item) => {
    if (item == null) return;
    item["title"] = item["nomeCompleto"];
    setSelectedItem(item);
    setDataNascimentoPaciente(item["dataNascimento"]);
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.circle}>
        <Image style={styles.imagem} source={logo} />
      </View>

      <View style={styles.containerCentral}>
        <Text style={styles.titulo}>Novo Agendamento</Text>

        <View style={styles.formContainer}>
          <View style={styles.labeledInput}>
            {showAutoComplete && (
              <AutocompleteDropdown
                style={styles.autoComplete}
                EmptyResultComponent={<Text>Nada Encontrado</Text>}
                inputContainerStyle={{
                  width: 250,
                }}
                initialValue={{ id: "1" }}
                dataSet={pacientes}
                onSelectItem={(value) => changeItem(value)}
              />
            )}
            {<Text style={styles.label}>Nome do Paciente</Text>}
          </View>

          <View style={styles.labeledInput}>
            <TextInput
              style={[styles.textInput, styles.text]}
              onTouchStart={() => setOpenDate(true)}
              value={getNascimentoFormatado(dataNascimento)}
            />
            <Text style={styles.label}>Data da Consulta</Text>
          </View>
          <View style={styles.labeledInput}>
            <TextInput
              style={[styles.textInput, styles.text]}
              value={getHorarioFormatado(horarioConsulta)}
              onTouchStart={() => setOpenHour(true)}
            />
            <DatePicker
              modal
              mode="date"
              locale="pt-BR"
              title={"Selecionar Data"}
              open={openDate}
              date={horarioConsulta}
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

            <DatePicker
              modal
              locale="pt-BR"
              is24hourSource="locale"
              mode="time"
              title={"Selecionar Horário"}
              open={openHour}
              minuteInterval={30}
              date={horarioConsulta}
              onConfirm={(data) => {
                setOpenHour(false);
                setHorarioConsulta(data);
              }}
              onCancel={() => {
                setOpenHour(false);
              }}
              confirmText="Confirmar"
              cancelText="Cancelar"
            />
            <Text style={styles.label}>Horário da Consulta</Text>

            <TouchableHighlight
              style={styles.buttonContainer}
              onPress={cadastraAgendamento}
            >
              <Text style={styles.button}>Agendar</Text>
              {/* <Button color={"#088cf4"} title="Cadastrar" onPress={cadastraAgendamento} /> */}
            </TouchableHighlight>

            <Text style={[styles.span, { color: buttonColor }]}>
              {textoBotao}
            </Text>
          </View>
        </View>
      </View>
      {/* <View style={styles.containerBotoesInferiores}> */}
      {/* <TouchableHighlight style={styles.botoesInferiores} onPress={() => setCadastrar(false)} > */}
      {/* <Image style={styles.imagemDeslogar} source={setaEsquerda} /> */}
      {/* </TouchableHighlight> */}
      {/* </View> */}
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
    height: 40,
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
  autoComplete: {
    width: 250,
  },
  buttonContainer: {
    width: 250,
    height: 40,
    borderRadius: 5,
    marginTop: 30,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#088cf4",
  },
  button: {
    fontSize: 18,
    width: "100%",
    color: "white",
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  span: {
    top: 150,
    fontFamily: "Inter_700Bold",
    position: "absolute",
    fontSize: 17,
    marginTop: 40,
  },
});
