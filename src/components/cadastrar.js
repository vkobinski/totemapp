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
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import utils from "../singletons/Utils";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { useEffect } from "react";

export function Cadastrar(props) {
  const setCadastrar = props["setCadastrar"];

  let [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const buttonGreen = "#00A701";
  const buttonRed = "#D00D0B";

  const sucessoCadastro = "Horário agendado com sucesso!";
  const fracassoCadastro = "Não foi possível encontrar paciente com esse nome.";

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

  let counter = 0;

  useEffect(() => {
    axios.get(utils.getData("/api/v1/paciente/ativo")).then((response) => {
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
        let pacientesTemp = pacientes;
        pacientesTemp.push(paciente);
        setPacientes(pacientesTemp);
      });
    });
  }, []);

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

    axios
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
        console.log(response.data);
        if (response.status === 404) {
          setTextoBotao("Paciente não encontrado");
          setButtonColor(buttonRed);
        } else {
          setButtonColor(buttonGreen);
          setTextoBotao("Sucesso!");
        }
      })
      .catch((error) => {
        setButtonColor(buttonRed);
        setTextoBotao("Erro ao Cadastrar!");
      });
  };

  const setaEsquerda = require("../../assets/seta-esquerda.png");

  const changeItem = (item) => {
    if (item == null) return;
    item["title"] = item["nomeCompleto"];
    setSelectedItem(item);
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
            <AutocompleteDropdown
              style={styles.autoComplete}
              EmptyResultComponent={<Text>Nada Encontrado</Text>}
              inputContainerStyle={{
                width: 250,
              }}
              initialValue={{ id: "1" }}
              dataSet={pacientes}
              onSelectItem={(value) => changeItem(value)}
            ></AutocompleteDropdown>
            {
              /* <TextInput
              style={[styles.textInput, styles.text]}
              value={nome}
              onChangeText={setNome}
            />
            */
              <Text style={styles.label}>Nome do Paciente</Text>
            }
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

            <View style={styles.buttonContainer}>
              <Button
                color={"#088cf4"}
                style={styles.button}
                title="Agendar"
                onPress={cadastraAgendamento}
              />
            </View>

            <Text style={[styles.span, { color: buttonColor }]}>
              {textoBotao}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.containerBotoesInferiores}>
        <TouchableHighlight
          style={styles.botoesInferiores}
          onPress={() => setCadastrar(false)}
        >
          <Image style={styles.imagemDeslogar} source={setaEsquerda} />
        </TouchableHighlight>
      </View>
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
