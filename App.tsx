import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, {
  ComponentProps,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaView from 'react-native-safe-area-view';
import { t } from 'react-native-tailwindcss';
import { iOSUIKit } from 'react-native-typography';

const DONE_GREEN = '#45c352';
const GRAY = '#595959';
const DARK_GRAY = '#202020';

const GREEN_PALETTE = ['#54c4aa', '#4cb19b', '#439e8e', '#3e8f84', '#358077'];
const PURPLE_PALETTE = ['#cca3f5', '#a573ed', '#8049ee', '#6629e9', '#480bd8'];
const GRAY_TEXT = { color: GRAY };
const BUTTON_HEIGHT = 65;
const CHECK_HEIGHT = 40;
const TODO_RADIUS = 25;
const BORDER_WIDTH = 2;
const LOADING_BOUNCE_HEIGHT = Math.floor(TODO_RADIUS / 2);

interface Todo {
  name: string;
  date: string;
}
const STATIC_DATA: { [k: string]: Todo[] } = {
  Personal: [
    { name: 'Caroobi Font Styleguide', date: 'Today' },
    { name: 'Workshop Aquisition Elements', date: 'Tomorrow' },
    { name: 'Icon Design', date: '14 Feb' },
    { name: 'Unify Header Visuals', date: '16 Feb' },
    { name: 'MLH Messaging', date: '20 Feb' },
  ],
  Team: [
    { name: 'Meeting with David', date: 'Tomorrow' },
    { name: 'New UI Presentation', date: 'Tomorrow' },
    { name: 'Product Planning', date: '16 Feb' },
    { name: 'Prototype Presentation', date: '18 Feb' },
    { name: 'Meeting with Mariam', date: '22 Feb' },
  ],
};

const ToggleSwitch: FunctionComponent<{
  options: [string, string];
  active: string;
  onChange: (value: string) => void;
}> = (props) => {
  const [firstOpt, secondOpt] = props.options;
  const firstOptionSelected = props.active === firstOpt;
  const [animation] = useState(new Animated.Value(firstOptionSelected ? 0 : 1));

  const [width, setWidth] = useState<number>(0);
  const captureWidth = (layoutEvent: LayoutChangeEvent) => {
    setWidth(layoutEvent.nativeEvent.layout.width);
  };

  const createHandler = (opt: string) => {
    return () => {
      props.onChange(opt);
      Animated.timing(animation, {
        toValue: opt === firstOpt ? 0 : 1,
        easing: Easing.inOut(Easing.cubic),
      }).start();
    };
  };

  const animatedBackgroundStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width / 2],
        }),
      },
    ],
  };

  const animatedFirstTextColor = {
    color: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#fff', GRAY],
    }),
  };

  const animatedSecondTextColor = {
    color: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [GRAY, '#fff'],
    }),
  };

  return (
    <View style={[styles.listTabContainer]} onLayout={captureWidth}>
      <Animated.View
        style={[styles.listTabBackground, animatedBackgroundStyle]}
      />
      <View onTouchStart={createHandler(firstOpt)} style={[styles.listTab]}>
        <Animated.Text style={[styles.listTabText, animatedFirstTextColor]}>
          {firstOpt}
        </Animated.Text>
      </View>
      <View onTouchStart={createHandler(secondOpt)} style={[styles.listTab]}>
        <Animated.Text style={[styles.listTabText, animatedSecondTextColor]}>
          {secondOpt}
        </Animated.Text>
      </View>
    </View>
  );
};

function prepareData<T>(data: T[], palette: string[]) {
  return data.map((t, i) => ({
    ...t,
    background: palette[i],
  }));
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeList, setList] = useState('Personal');
  const [data, setData] = useState(
    prepareData(STATIC_DATA[activeList], GREEN_PALETTE)
  );
  const [lastDismissed, setLastDismissed] = useState<
    // Capture index for proper "undo"
    [string, number] | undefined
  >();

  const loadTimer = useRef<number | null>(null);
  const changeList = (list: string) => {
    setList(list);
    setIsLoading(true);
    setLastDismissed(undefined);
    clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => {
      const palette = list === 'Personal' ? GREEN_PALETTE : PURPLE_PALETTE;
      setData(prepareData(STATIC_DATA[list], palette));
      setIsLoading(false);
    }, 800);
  };

  const topCard = data[data.length - 1];

  const [loadingAnimation] = useState(new Animated.Value(isLoading ? 0 : 1));
  useEffect(() => {
    Animated.timing(loadingAnimation, {
      toValue: isLoading ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [isLoading]);

  const [dismissAnimation] = useState(new Animated.Value(0));
  useEffect(() => {
    if (!lastDismissed) {
      return;
    }
    const [dismissedTodoName, _index] = lastDismissed;
    dismissAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(dismissAnimation, {
        toValue: 1,
        duration: 350,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.timing(dismissAnimation, {
        toValue: 2,
        duration: 500,
        delay: 150,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.timing(dismissAnimation, {
        toValue: 3,
        delay: 150,
        duration: 666,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start(() => {
      setData(data.filter((t) => t.name !== dismissedTodoName));
    });
  }, [lastDismissed]);

  const todoLoadingStyles = {
    paddingTop: loadingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 16 + LOADING_BOUNCE_HEIGHT / 2],
    }),
    marginBottom: loadingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-TODO_RADIUS - LOADING_BOUNCE_HEIGHT, -TODO_RADIUS],
    }),
  };
  const textLoadingStyles = {
    opacity: loadingAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  const makeDismissingStyles = (todo: typeof data[0]) => {
    return {
      todoContainer: {
        paddingTop: dismissAnimation.interpolate({
          inputRange: [0, 1, 2],
          extrapolate: 'clamp',
          outputRange: [16, 16 + LOADING_BOUNCE_HEIGHT / 2, 16],
        }),
        marginBottom: dismissAnimation.interpolate({
          inputRange: [0, 1, 2],
          extrapolate: 'clamp',
          outputRange: [
            -TODO_RADIUS - LOADING_BOUNCE_HEIGHT,
            -TODO_RADIUS,
            -TODO_RADIUS - LOADING_BOUNCE_HEIGHT,
          ],
        }),
        backgroundColor: dismissAnimation.interpolate({
          inputRange: [0, 1, 2, 3],
          outputRange: [todo.background, DONE_GREEN, DONE_GREEN, 'white'],
        }),
        height: dismissAnimation.interpolate({
          inputRange: [2, 3],
          extrapolate: 'clamp',
          outputRange: [
            BUTTON_HEIGHT + TODO_RADIUS + LOADING_BOUNCE_HEIGHT,
            TODO_RADIUS + LOADING_BOUNCE_HEIGHT,
          ],
        }),
        transform: [
          {
            translateY: dismissAnimation.interpolate({
              inputRange: [2, 3],
              extrapolate: 'clamp',
              outputRange: [0, 20],
            }),
          },
        ],
      },
      text: {
        // Fade out white on 1st phase
        opacity: dismissAnimation.interpolate({
          inputRange: [0, 1],
          extrapolate: 'clamp',
          outputRange: [1, 0],
        }),
      },
      button: {
        // Fade to white on 1st phase
        backgroundColor: dismissAnimation.interpolate({
          inputRange: [0, 1],
          extrapolate: 'clamp',
          outputRange: ['rgba(0, 0, 0, 0.1)', 'white'],
        }),
        opacity: dismissAnimation.interpolate({
          inputRange: [2, 3],
          extrapolate: 'clamp',
          outputRange: [1, 0],
        }),
      },
      // // Icon does not accept animated color value. Change is a jump
      // buttonIcon: {
      //   color: dismissAnimation.interpolate({
      //     inputRange: [0, 1],
      //     extrapolate: 'clamp',
      //     outputRange: ['white', DONE_GREEN],
      //   }),
      // },
      doneText: {
        // Fade in on 2nd phase
        opacity: dismissAnimation.interpolate({
          inputRange: [1, 2, 3],
          outputRange: [0, 1, 0],
        }),
        transform: [
          {
            translateY: dismissAnimation.interpolate({
              inputRange: [1, 2],
              extrapolate: 'clamp',
              outputRange: [-20, 0],
            }),
          },
        ],
      },
    };
  };

  return (
    <>
      <StatusBar translucent={false} barStyle="light-content" />
      <SafeAreaProvider>
        <View style={[t.bgBlack, t.flexGrow]}>
          <SafeAreaView style={[t.flexRow, t.itemsCenter, t.pX8]}>
            <View style={[t.flexGrow, t.mT3]}>
              <Text style={[iOSUIKit.subheadEmphasized, t.mB3, GRAY_TEXT]}>
                Welcome Back
              </Text>

              <Text style={[iOSUIKit.largeTitleEmphasizedWhite]}>Karlo</Text>
            </View>
            <View style={[styles.circleButton]}>
              <MaterialCommunityIcons
                name="arrow-right"
                style={[t.text3xl, GRAY_TEXT]}
              />
            </View>
          </SafeAreaView>

          <ToggleSwitch
            options={['Personal', 'Team']}
            active={activeList}
            onChange={changeList}
          />

          <View style={[t.flexGrow, t.mX3, t.mT8]}>
            {data.map((todo, index) => {
              const dismissingStyles =
                (lastDismissed?.[0] === todo.name &&
                  makeDismissingStyles(todo)) ||
                undefined;
              return (
                <Animated.View
                  key={todo.name}
                  style={[
                    { backgroundColor: todo.background },
                    styles.todoContainer,
                    todoLoadingStyles,
                    dismissingStyles?.todoContainer,
                  ]}
                >
                  <View style={[t.flexRow]}>
                    <View style={[t.flexGrow, t.relative]}>
                      <Animated.Text
                        style={[
                          iOSUIKit.subheadEmphasizedWhite,
                          textLoadingStyles,
                          dismissingStyles?.text,
                        ]}
                      >
                        {todo.name}
                      </Animated.Text>
                      <Animated.Text
                        style={[
                          iOSUIKit.footnoteEmphasized,
                          textLoadingStyles,
                          { color: 'rgba(255, 255, 255, 0.6)' },
                          dismissingStyles?.text,
                        ]}
                      >
                        {todo.date}
                      </Animated.Text>
                      {dismissingStyles && (
                        <View style={[t.absolute, t.inset0, t.justifyCenter]}>
                          <Animated.Text
                            style={[
                              iOSUIKit.subheadEmphasizedWhite,
                              dismissingStyles?.doneText,
                            ]}
                          >
                            Marked as Done
                          </Animated.Text>
                        </View>
                      )}
                    </View>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setLastDismissed([todo.name, index]);
                      }}
                    >
                      <Animated.View
                        style={[
                          styles.todoButton,
                          textLoadingStyles,
                          dismissingStyles?.button,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="check"
                          style={[
                            t.textXl,
                            dismissingStyles
                              ? { color: DONE_GREEN }
                              : t.textWhite,
                          ]}
                        />
                      </Animated.View>
                    </TouchableWithoutFeedback>
                  </View>
                </Animated.View>
              );
            })}
            <View
              style={[t.flexGrow, { backgroundColor: topCard?.background }]}
            />
          </View>
        </View>
      </SafeAreaProvider>
    </>
  );
}

const roundedButtonStyle = {
  height: BUTTON_HEIGHT,
  borderRadius: BUTTON_HEIGHT / 2,
  borderWidth: BORDER_WIDTH,
  borderColor: DARK_GRAY,
};

const styles = StyleSheet.create({
  todoContainer: {
    ...t.pT4,
    ...t.pX5,

    height: BUTTON_HEIGHT + TODO_RADIUS + LOADING_BOUNCE_HEIGHT,
    borderTopLeftRadius: TODO_RADIUS,
    borderTopRightRadius: TODO_RADIUS,
  },
  todoButton: {
    ...t.justifyCenter,
    ...t.itemsCenter,
    width: CHECK_HEIGHT,
    height: CHECK_HEIGHT,
    borderRadius: CHECK_HEIGHT / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  circleButton: {
    ...t.itemsCenter,
    ...t.justifyCenter,
    width: BUTTON_HEIGHT,
    ...roundedButtonStyle,
  },
  listTabContainer: {
    ...t.flexRow,
    ...t.relative,
    ...t.itemsStretch,
    ...t.mX3,
    ...t.mT8,
    ...roundedButtonStyle,
  },
  listTab: {
    width: '50%',
    // ...t.flexGrow,
    // ...t.flexShrink0,
    ...t.itemsCenter,
    ...t.justifyCenter,
  },
  listTabText: {
    ...iOSUIKit.title3EmphasizedObject,
  },
  listTabBackground: {
    ...t.absolute,
    ...roundedButtonStyle,
    borderWidth: 0,
    backgroundColor: DARK_GRAY,
    width: '50%',
    top: -BORDER_WIDTH,
  },
});
