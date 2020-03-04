import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { t } from "react-native-tailwindcss";
import { ShadowSvg } from "react-native-neomorph-shadows";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { human } from "react-native-typography";
import Toast from "react-native-root-toast";

const YELLOW_BG = "#F8E3B7";
const ORANGE_ACTION = "#E5855F";
const DARKBLUE_COMPLETE = "#282B43";

export default function App() {
  const [filename, setFilename] = useState<string | undefined>();
  const animatedButtonMargin = t.m1;
  const animatedScale = {transform: [ { scale: 1.0 }]}

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        style={[t.bgWhite, t.roundedLg, t.shadowXl, { minWidth: "75%" }, animatedScale]}
        // onPress={() => Toast.show('outer')}
      >
        <View style={[t.flexRow]}>
          <View style={[t.flex1, t.flexRow, t.itemsCenter, t.pX3]}>
            <MaterialCommunityIcons name="paperclip" size={24} />
            <Text style={[human.body, t.mL2, !filename && t.textGray600]}>{filename ? filename : 'Select a file'}</Text>
          </View>
          <TouchableWithoutFeedback
            style={[
              t.pY4,
              t.pX2,
              t.roundedLg,
              animatedButtonMargin,
              { backgroundColor: ORANGE_ACTION }
            ]}
            // onPress={() => Toast.show('inner')}
          >
            <Text style={[human.body, t.textWhite]}>Upload</Text>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YELLOW_BG,
    alignItems: "center",
    justifyContent: "center"
  }
});
