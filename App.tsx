import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { t } from "react-native-tailwindcss";
import { human } from "react-native-typography";

const YELLOW_BG = "#F8E3B7";
const ORANGE_ACTION = "#E5855F";
const DARKBLUE_COMPLETE = "#282B43";

export default function App() {
  const [filename, setFilename] = useState<string | undefined>();
  const [showButtonClone, setShowButtonClone] = useState(false);

  const [buttonWidth, setButtonWidth] = useState<number | null>(null);
  const captureButtonWidth = (layoutEvent: LayoutChangeEvent) => {
    if (showButtonClone) {
      setButtonWidth(layoutEvent.nativeEvent.layout.width);
    }
  };

  const [componentWidth, setComponentWidth] = useState<number | null>(null);
  const captureComponentWidth = (layoutEvent: LayoutChangeEvent) => {
    if (componentWidth === null) {
      // Only do this once
      setComponentWidth(layoutEvent.nativeEvent.layout.width);
    }
  };

  const [pressBounceAnimation] = useState(new Animated.Value(0));
  const [fileUploadProgress] = useState(new Animated.Value(0));
  const [startUploadAnimation] = useState(new Animated.Value(0));
  const [finishUploadAnimation] = useState(new Animated.Value(0));

  const animatedButtonMargin = {
    margin: startUploadAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 0],
      extrapolate: "clamp"
    }),
    paddingHorizontal: startUploadAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 16],
      extrapolate: "clamp"
    })
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

  const buttonCloneStyles = {
    width: startUploadAnimation.interpolate({
      inputRange: [1, 2],
      outputRange: [buttonWidth, componentWidth]
    })
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
    Animated.timing(startUploadAnimation, { toValue: 1, delay: 125 }).start(
      () => {
        setShowButtonClone(true);
        Animated.timing(startUploadAnimation, {
          toValue: 2,
          delay: 100
        }).start(() => {
          // Start file upload (saga in real life?)
        });
      }
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          t.flexRow,
          t.bgWhite,
          t.roundedLg,
          t.shadowXl,
          t.relative,
          {
            minWidth: "75%"
            // height: buttonHeight
          },
          animatedScale
        ]}
        onLayout={captureComponentWidth}
      >
        {showButtonClone && (
          <Animated.View
            style={[
              t.absolute,
              t.roundedLg,
              {
                backgroundColor: ORANGE_ACTION,
                right: 0,
                height: "100%"
              },
              buttonCloneStyles
            ]}
          />
        )}
        <View style={[t.flex1]}>
          <TouchableWithoutFeedback
            style={[t.flexRow, t.itemsCenter, t.pY5, t.pX3]}
            onPressIn={() => !filename && animatePressIn()}
            onPressOut={animatePressOut}
            onPress={() => !filename && pickFile()}
          >
            <MaterialCommunityIcons name="paperclip" size={24} />
            <Text style={[human.body, t.mL2, !filename && t.textGray600]}>
              {filename ? filename : "Select a file"}
            </Text>
          </TouchableWithoutFeedback>
        </View>
        <TouchableWithoutFeedback
          style={[
            t.flex1,
            // t.wFull,
            t.justifyCenter,
            t.pX3,
            t.roundedLg,
            animatedButtonMargin,
            { backgroundColor: ORANGE_ACTION }
          ]}
          onPress={() => (filename ? startUpload() : pickFile())}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onLayout={captureButtonWidth}
        >
          <Text style={[human.body, t.textWhite]}>Upload</Text>
        </TouchableWithoutFeedback>
      </Animated.View>
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
