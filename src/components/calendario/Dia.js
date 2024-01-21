import { View, Text } from "react-native";

export default function Dia({style, item, dayIndex, daysTotal}) {
    const tocar = () => {

    };

    return (
        <View style={{
            ...style, 
            backgroundColor: 'red',
            borderRadius: 10,
            elevation: 5,
        }}
        onTouchStart={tocar}
        >
            <Text>{item.title}</Text>
            <Text>{dayIndex} of {daysTotal}</Text>
        </View>
    );
}