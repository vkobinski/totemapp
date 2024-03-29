import { BlurView } from "@react-native-community/blur";
import React, { useRef } from "react";
import { View, Text, StyleSheet, Image, PanResponder} from "react-native";
import { TouchableOpacity } from "react-native";

export function Atendimento(props) {
  const { paciente, chegou, fotoPaciente, horario, verPaciente, pararVerPaciente } = props;

  const user = require("../../assets/user.png");


  const foto = () => {
    if(fotoPaciente === undefined || fotoPaciente === null){
      return user;
    }


    return {uri: fotoPaciente};
  };

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <TouchableOpacity onPress={() => verPaciente(foto())} >
          <Image style={styles.imagem} source={foto()}  />
        </TouchableOpacity>
        <View>
          <Text style={styles.text}>{paciente}</Text>
          <Text style={styles.horario}>Horário: {horario}</Text>
        </View>
      </View>

      <View
        style={[
          chegou === true ? styles.circuloChegou : styles.circuloNaoChegou,
          styles.circulo,
        ]}
      ></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 80,
    width: "80%",
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    borderBottomColor: "#ffb40c",

    borderBottomWidth: 1,
    zIndex: 0,
  },
  container2: {
    flexDirection: "row",
    alignItems: "center",
  },
  circulo: {
    width: 12,
    height: 12,
    borderRadius: 20,
  },
  circuloChegou: {
    backgroundColor: "#00A701",
  },
  circuloNaoChegou: {
    backgroundColor: "#D00D0B",
  },
  text: {
    color: "#000",
    fontSize: 17,
  },
  horario: {
    marginTop: 1,
    color: "#000",
    fontSize: 11,
  },
  imagem: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 40,
    marginRight: 20,
  },
});
