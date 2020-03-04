import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  LayoutChangeEvent
} from "react-native";
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
  const [pressBounceAnimation] = useState(new Animated.Value(0));
  const [fileUploadProgress] = useState(new Animated.Value(0));
  const [startUploadAnimation] = useState(new Animated.Value(0));
  const [finishUploadAnimation] = useState(new Animated.Value(0));

  const [filename, setFilename] = useState<string | undefined>();
  const animatedButtonMargin = {
    margin: startUploadAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 0]
    })
    // minHeight: startUploadAnimation.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: ['0%', '100%'],
    // })
  };
  const animatedScale = {
    transform: [
      {
        scale: pressBounceAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.96]
        })
      }
    ]
  };

  const [buttonHeight, setButtonHeight] = useState<number | null>(null);
  const captureButtonHeight = (layoutEvent: LayoutChangeEvent) => {
    if (buttonHeight === null) {
      // Only do this once
      setButtonHeight(layoutEvent.nativeEvent.layout.height);
    }
  };

  const animatePressIn = () => {
    Animated.timing(pressBounceAnimation, { toValue: 1, duration: 80 }).start();
  };

  const animatePressOut = () => {
    Animated.timing(pressBounceAnimation, {
      toValue: 0,
      easing: Easing.bounce
    }).start();
  };

  const pickFile = () => {
    Alert.alert(
      "File picker",
      "Pretend this is a file picker",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pick",
          onPress: () => setFilename("Document.pdf")
        }
      ],
      { cancelable: true }
    );
  };

  const startUpload = () => {
    Animated.timing(startUploadAnimation, { toValue: 1 }).start(() => {
      // Fire upload saga, listen to progress?
    });
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        style={[
          t.bgWhite,
          t.rounded,
          t.shadowXl,
          t.relative,
          {
            minWidth: "75%"
            // height: buttonHeight
          },
          animatedScale
        ]}
        onPressIn={() => !filename && animatePressIn()}
        onPressOut={animatePressOut}
        onPress={() => !filename && pickFile()}
        onLayout={captureButtonHeight}
      >
        <View style={[t.flexRow, t.bgWhite, t.roundedLg, t.shadowXl]}>
          <View style={[t.flex1, t.flexRow, t.itemsCenter, t.pX3, t.pY5]}>
            <MaterialCommunityIcons name="paperclip" size={24} />
            <Text style={[human.body, t.mL2, !filename && t.textGray600]}>
              {filename ? filename : "Select a file"}
            </Text>
          </View>
          <TouchableWithoutFeedback
            style={[
              t.flex1,
              t.justifyCenter,
              t.pX3,
              t.roundedLg,
              animatedButtonMargin,
              { backgroundColor: ORANGE_ACTION }
            ]}
            onPress={() => !!filename && startUpload()}
            onPressIn={() => !!filename && animatePressIn()}
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
