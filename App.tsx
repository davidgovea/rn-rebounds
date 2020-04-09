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
import { t, color } from 'react-native-tailwindcss';
import { human, iOSUIKit, iOSColors } from 'react-native-typography';
import Toast from 'react-native-root-toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaView from 'react-native-safe-area-view';
const DONE_GREEN = '#45c352';
const GRAY = '#595959';
const DARK_GRAY = '#202020';

const GREEN_PALETTE = ['#54c4aa', '#4cb19b', '#439e8e', '#3e8f84', '#358077'];
const PURPLE_PALETTE = ['#cca3f5', '#a573ed', '#8049ee', '#6629e9', '#480bd8'];
const GRAY_TEXT = { color: GRAY };
const BUTTON_HEIGHT = 65;
const CHECK_HEIGHT = 40;
const TODO_RADIUS = 25;

interface Todo {
  name: string;
  date: string;
}
const STATIC_DATA: { [k: string]: Todo[] } = {
  personal: [
    { name: 'Caroobi Font Styleguide', date: 'Today' },
    { name: 'Workshop Aquisition Elements', date: 'Tomorrow' },
    { name: 'Icon Design', date: '14 Feb' },
    { name: 'Unify Header Visuals', date: '16 Feb' },
    { name: 'MLH Messaging', date: '20 Feb' },
  ],
  team: [
    { name: 'Meeting with David', date: 'Tomorrow' },
    { name: 'New UI Presentation', date: 'Tomorrow' },
    { name: 'Product Planning', date: '16 Feb' },
    { name: 'Prototype Presentation', date: '18 Feb' },
    { name: 'Meeting with Mariam', date: '22 Feb' },
  ],
};

export default function App() {
  const [activeList, setList] = useState<'personal' | 'team'>('personal');
  const [data, setData] = useState<Array<Todo & { background: string }>>(
    STATIC_DATA[activeList].map((t, i) => ({
      ...t,
      background: GREEN_PALETTE[i],
    }))
  );

  return (
    <SafeAreaProvider>
      <View style={[t.bgBlack, t.flexGrow]}>
        <SafeAreaView style={[t.flexRow, t.itemsCenter, t.p8]}>
          <View style={[t.flexGrow]}>
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
        <View style={[styles.listTabContainer]}>
          <View style={[styles.listTabBackground]} />
          <View style={[styles.listTab]}>
            <Text style={[styles.listTabText]}>Personal</Text>
          </View>
          <View style={[styles.listTab]}>
            <Text style={[styles.listTabText]}>Team</Text>
          </View>
        </View>

        <View style={[t.mX3, t.mT8]}>
          {data.map((todo) => (
            <View
              style={[
                t.pT4,
                t.pX5,
                {
                  height: BUTTON_HEIGHT + TODO_RADIUS,
                  borderTopLeftRadius: TODO_RADIUS,
                  borderTopRightRadius: TODO_RADIUS,
                  backgroundColor: todo.background,
                  marginBottom: -TODO_RADIUS,
                },
              ]}
            >
              <View style={[t.flexRow]}>
                <View style={[t.flexGrow]}>
                  <Text style={[iOSUIKit.subheadEmphasizedWhite]}>
                    {todo.name}
                  </Text>
                  <Text
                    style={[
                      iOSUIKit.footnoteEmphasized,
                      { color: 'rgba(255, 255, 255, 0.6)' },
                    ]}
                  >
                    {todo.date}
                  </Text>
                </View>
                <View
                  style={[
                    t.justifyCenter,
                    t.itemsCenter,
                    {
                      width: CHECK_HEIGHT,
                      height: CHECK_HEIGHT,
                      borderRadius: CHECK_HEIGHT / 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check"
                    style={[t.textXl, t.textWhite]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const roundedButtonStyle = {
  height: BUTTON_HEIGHT,
  borderRadius: BUTTON_HEIGHT / 2,
  borderWidth: 2,
  borderColor: DARK_GRAY,
};

const styles = StyleSheet.create({
  circleButton: {
    ...t.itemsCenter,
    ...t.justifyCenter,
    width: BUTTON_HEIGHT,
    ...roundedButtonStyle,
  },
  listTabContainer: {
    ...t.flexRow,
    ...t.relative,
    ...t.itemsCenter,
    ...t.mX3,
    ...roundedButtonStyle,
  },
  listTab: {
    width: '50%',
    // ...t.flexGrow,
    // ...t.flexShrink0,
    ...t.itemsCenter,
  },
  listTabText: {
    ...iOSUIKit.title3EmphasizedObject,
    color: GRAY,
  },
  listTabBackground: {
    ...t.absolute,
    ...roundedButtonStyle,
    backgroundColor: DARK_GRAY,
    width: '50%',
    left: 0,
  },
});
