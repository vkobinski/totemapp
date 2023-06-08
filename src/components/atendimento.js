import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export function Atendimento(props) {

    const {paciente, chegou, horario} = props;

    checkmark = require("../../assets/checkmark.png");
    xmark = require("../../assets/xcross.jpg");

    return (   
        <View style={styles.container}>
            <Text style={styles.text}>{paciente}</Text>
            <Image source={chegou ? checkmark : xmark} style={{width: 40, height: 40}}></Image>
            <Text style={styles.text}>{horario}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: "#292557",
        justifyContent: 'space-between',
        height: 80,
        width: "100%",
        padding: 20,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center'
    },
    text: {
        color: 'white',
    },
});