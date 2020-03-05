import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
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
import Toast from 'react-native-root-toast';

const YELLOW_BG = '#F8E3B7';
const ORANGE_ACTION = '#E5855F';
const DARKBLUE_COMPLETE = '#282B43';
const PROGRESS_BAR_HEIGHT = 8;

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
    // if (componentDimensions === null) {
    // Only do this once
    setComponentDimensions(layoutEvent.nativeEvent.layout);
    // }
  };
  const componentHeight = componentDimensions?.height || 0;
  const componentWidth = componentDimensions?.width || 0;

  const [pressBounceAnimation] = useState(new Animated.Value(0));
  const [uploadAnimation] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));
  const [finalAnimation] = useState(new Animated.Value(0));

  const pressScale = pressBounceAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });
  const completedScale = uploadAnimation.interpolate({
    inputRange: [3.75, 3.9, 4],
    outputRange: [1, 1.04, 1],
    easing: Easing.ease,
    extrapolate: 'clamp',
  });
  const combinedScale = Animated.add(pressScale, completedScale);
  const animatedComponentScale = {
    transform: [
      {
        scale: Animated.add(-1, combinedScale),
        // scale:pressScale
      },
    ],
  };

  const animatedButtonStyles = {
    margin: uploadAnimation.interpolate({
      inputRange: [0, 1, 2.99, 3],
      outputRange: [4, 0, 0, 4],
      extrapolate: 'clamp',
    }),
    paddingHorizontal: uploadAnimation.interpolate({
      inputRange: [0, 1, 2.99, 3],
      outputRange: [12, 16, 16, 12],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [1, 2, 3, 3.9],
          outputRange: [0, -componentHeight, -componentHeight, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: uploadAnimation.interpolate({
          inputRange: [0, 2.99, 3, 3.65, 4],
          outputRange: [1, 1, 0.9, 0.9, 1],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const buttonCloneStyles = {
    width: uploadAnimation.interpolate({
      inputRange: [1, 2],
      outputRange: [buttonWidth, componentWidth],
    }),
  };

  const mainTextStyles = {
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [1, 2, 3, 3.9],
          outputRange: [0, -componentHeight, -componentHeight, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: uploadAnimation.interpolate({
          inputRange: [0, 2.99, 3, 3.65, 4],
          outputRange: [1, 1, 0.9, 0.9, 1],
          extrapolate: 'clamp',
        }),
      },
    ],
    opacity: uploadAnimation.interpolate({
      inputRange: [1, 1.5, 2.99, 3],
      outputRange: [1, 0, 0, 1],
      extrapolate: 'clamp',
    }),
  };

  const uploadingTextStyles = {
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [1, 2],
          outputRange: [componentHeight, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const completeBoxStyles = {
    width: progressAnimation.interpolate({
      inputRange: [0, 100],
      outputRange: [0, componentWidth],
    }),
    height: uploadAnimation.interpolate({
      inputRange: [2, 3],
      outputRange: [PROGRESS_BAR_HEIGHT, componentHeight],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [3, 4],
          outputRange: [0, componentHeight],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
  const completeTextStyles = {
    transform: [
      {
        translateY: uploadAnimation.interpolate({
          inputRange: [2, 3, 4],
          outputRange: [
            componentHeight - PROGRESS_BAR_HEIGHT,
            0,
            componentHeight,
          ],
          extrapolate: 'clamp',
        }),
      },
    ],
    opacity: uploadAnimation.interpolate({
      inputRange: [0, 1.99, 2],
      outputRange: [0, 0, 1],
    }),
  };

  const [pressAnimationPromise, setPressAnimationPromise] = useState(
    Promise.resolve()
  );
  const animatePressIn = () => {
    setPressAnimationPromise(new Promise((r) => setTimeout(r, 100)));
    Animated.timing(pressBounceAnimation, { toValue: 1, duration: 80 }).start();
  };

  const animatePressOut = () => {
    pressAnimationPromise.then(() => {
      Animated.timing(pressBounceAnimation, {
        toValue: 0,
        easing: Easing.bounce,
      }).start();
    });
  };

  const pickFile = () => {
    setTimeout(
      () =>
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
        ),
      250
    );
  };

  const startUpload = () => {
    Animated.timing(uploadAnimation, {
      toValue: 1,
      delay: 125,
      easing: Easing.inOut(Easing.cubic),
    }).start(() => {
      setUploadStarted(true);
      Animated.timing(uploadAnimation, {
        toValue: 2,
        delay: 100,
        easing: Easing.inOut(Easing.cubic),
      }).start(() => {
        simulateUpload();
      });
    });
  };

  const finishUpload = () => {
    setFilename(undefined);
    Animated.timing(uploadAnimation, {
      toValue: 3,
      delay: 666,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setUploadStarted(false);
      Animated.parallel([
        Animated.timing(uploadAnimation, {
          toValue: 4,
          duration: 666,
          delay: 1500,
          easing: Easing.inOut(Easing.cubic),
        }),
      ]).start(() => {
        finalAnimation.setValue(0);
        progressAnimation.setValue(0);
        uploadAnimation.setValue(0);
      });
    });
  };

  const reset = () => {
    setFilename(undefined);
    setUploadStarted(false);
    progressAnimation.setValue(0);
    uploadAnimation.setValue(0);
  };

  useEffect(() => {
    Animated.timing(progressAnimation, { toValue: uploadProgress }).start(
      () => {
        if (uploadProgress >= 100) {
          finishUpload();
        }
      }
    );
  }, [uploadProgress]);

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      const increment = Math.random() * 25;
      progress += increment;
      if (progress > 100) {
        clearInterval(interval);
        setUploadProgress(100);
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
              // t.hFull,
              {
                height: componentHeight,
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
            <>
              <MaterialCommunityIcons name="paperclip" size={24} />
              <Text style={[human.title3, t.mL2, !filename && t.textGray600]}>
                {filename ? filename : 'Select a file'}
              </Text>
            </>
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
            animatedButtonStyles,
          ]}
          onPress={() => (filename ? startUpload() : pickFile())}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onLayout={captureButtonWidth}
        >
          <Animated.Text style={[human.title3, t.textWhite]}>
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
                style={[human.title3, t.textWhite, uploadingTextStyles]}
              >
                Uploading...
              </Animated.Text>
            </View>
          </>
        )}
        <Animated.View
          style={[
            t.absolute,
            t.insetX0,
            { backgroundColor: DARKBLUE_COMPLETE, bottom: 0 },
            completeBoxStyles,
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            t.absolute,
            t.inset0,
            t.hFull,
            t.justifyCenter,
            t.itemsCenter,
          ]}
        >
          <Animated.View
            style={[
              t.flexRow,
              t.justifyCenter,
              t.itemsCenter,
              completeTextStyles,
            ]}
          >
            <MaterialCommunityIcons
              name="check"
              size={20}
              style={[t.textWhite]}
            />
            <Text style={[human.title3, t.textWhite, t.mL2]}>Completed</Text>
          </Animated.View>
        </View>
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
