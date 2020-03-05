import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  LayoutRectangle,
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { t } from 'react-native-tailwindcss';
import { human } from 'react-native-typography';

const YELLOW_BG = '#F8E3B7';
const ORANGE_ACTION = '#E5855F';
const DARKBLUE_COMPLETE = '#282B43';

export default function App() {
  const [filename, setFilename] = useState<string | undefined>();
  const [uploadStarted, setUploadStarted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [buttonWidth, setButtonWidth] = useState<number | null>(null);
  const captureButtonWidth = (layoutEvent: LayoutChangeEvent) => {
    if (uploadStarted) {
      setButtonWidth(layoutEvent.nativeEvent.layout.width);
    }
  };

  const [
    componentDimensions,
    setComponentDimensions,
  ] = useState<LayoutRectangle | null>(null);
  const captureComponentDimensions = (layoutEvent: LayoutChangeEvent) => {
    if (componentDimensions === null) {
      // Only do this once
      setComponentDimensions(layoutEvent.nativeEvent.layout);
    }
  };

  const [pressBounceAnimation] = useState(new Animated.Value(0));
  const [uploadAnimation] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));

  const animatedComponentScale = {
    transform: [
      {
        scale: pressBounceAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.96],
        }),
      },
    ],
  };

  const animatedButtonMargin = {
    margin: uploadAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 0],
      extrapolate: 'clamp',
    }),
    paddingHorizontal: uploadAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 16],
      extrapolate: 'clamp',
    }),
  };

  const buttonCloneStyles = {
    width: uploadAnimation.interpolate({
      inputRange: [1, 2],
      outputRange: [buttonWidth, componentDimensions?.width || 0],
    }),
  };

  const mainTextStyles = {
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [1, 2],
          outputRange: [0, -(componentDimensions?.height || 0) / 2],
          extrapolate: 'clamp',
        }),
      },
    ],
    opacity: uploadAnimation.interpolate({
      inputRange: [1, 1.5],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
  };

  const uploadingTextStyles = {
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [1, 2],
          outputRange: [(componentDimensions?.height || 0) / 2, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const completeBoxStyles = {
    width: progressAnimation.interpolate({
      inputRange: [0, 100],
      outputRange: [0, componentDimensions?.width || 0],
    }),
  };

  useEffect(() => {
    Animated.timing(progressAnimation, {toValue: uploadProgress}).start();
  }, [uploadProgress]);

  const animatePressIn = () => {
    Animated.timing(pressBounceAnimation, { toValue: 1, duration: 80 }).start();
  };

  const animatePressOut = () => {
    Animated.timing(pressBounceAnimation, {
      toValue: 0,
      easing: Easing.bounce,
    }).start();
  };

  const pickFile = () => {
    Alert.alert(
      'File picker',
      'Pretend this is a file picker',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pick',
          onPress: () => setFilename('Document.pdf'),
        },
      ],
      { cancelable: true }
    );
  };

  const startUpload = () => {
    Animated.timing(uploadAnimation, { toValue: 1, delay: 125 }).start(() => {
      setUploadStarted(true);
      Animated.timing(uploadAnimation, {
        toValue: 2,
        delay: 100,
      }).start(() => {
        simulateUpload();
      });
    });
  };

  const finishUpload = () => {
    Animated.timing(uploadAnimation, { toValue: 3 }).start(() =>
      Animated.timing(uploadAnimation, { toValue: 4 })
    );
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      const increment = Math.random() * 25;
      progress += increment;
      if (progress > 100) {
        clearInterval(interval);
        setUploadProgress(100);
        finishUpload();
      } else {
        setUploadProgress(progress);
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          t.overflowHidden,
          t.flexRow,
          t.bgWhite,
          t.roundedLg,
          t.shadowXl,
          t.relative,
          {
            minWidth: '75%',
            // height: buttonHeight
          },
          animatedComponentScale,
        ]}
        onLayout={captureComponentDimensions}
      >
        {uploadStarted && (
          <Animated.View
            style={[
              t.absolute,
              t.roundedLg,
              t.hFull,
              {
                backgroundColor: ORANGE_ACTION,
                right: 0,
              },
              buttonCloneStyles,
            ]}
          />
        )}
        <View style={[t.flex1]}>
          <TouchableWithoutFeedback
            style={[t.flexRow, t.itemsCenter, t.pY5, t.pX3, mainTextStyles]}
            onPressIn={() => !filename && animatePressIn()}
            onPressOut={animatePressOut}
            onPress={() => !filename && pickFile()}
          >
            <MaterialCommunityIcons name="paperclip" size={24} />
            <Text style={[human.body, t.mL2, !filename && t.textGray600]}>
              {filename ? filename : 'Select a file'}
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
            { backgroundColor: ORANGE_ACTION },
            animatedButtonMargin,
          ]}
          onPress={() => (filename ? startUpload() : pickFile())}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onLayout={captureButtonWidth}
        >
          <Animated.Text style={[human.body, t.textWhite, mainTextStyles]}>
            Upload
          </Animated.Text>
        </TouchableWithoutFeedback>
        {uploadStarted && (
          <>
            <View
              style={[
                t.absolute,
                t.inset0,
                t.hFull,
                t.justifyCenter,
                t.itemsCenter,
              ]}
            >
              <Animated.Text
                style={[human.body, t.textWhite, uploadingTextStyles]}
              >
                Uploading...
              </Animated.Text>
            </View>
            <Animated.View
              style={[
                t.absolute,
                t.insetX0,
                t.h2,
                { backgroundColor: DARKBLUE_COMPLETE, bottom: 0 },
                completeBoxStyles,
              ]}
            />
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
