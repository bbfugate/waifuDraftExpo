import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView} from 'react-native';
import { Text, Button, TouchableRipple } from 'react-native-paper';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';

//Screens
import HomeScreen from '../screens/Home';
import VoteDetailsScreen from '../screens/VoteDetails';
import CharDetailsScreen from '../screens/CharDetails';
import ProfileScreen from '../screens/Profile';

import TradeScreen from '../screens/Trade';
import OtherUserProfileScreen from '../screens/OtherUserProfile';
import OtherUserCharDetailsScreen from '../screens/OtherUserCharDetails';
import NewTradeScreen from '../screens/NewTrade';
import ViewTradeScreen from '../screens/ViewTrade';

import SearchScreen from '../screens/Search';
import SearchSeriesScreen from '../screens/SearchSeries';
import SearchCharactersScreen from '../screens/SearchCharacters';
import SubmitCharacterScreen from '../screens/SubmitCharacter';

import store from '../redux/store';
import { LOADING_UI } from '../redux/types';

//Chroma
const chroma = require('chroma-js')

const INITIAL_ROUTE_NAME = 'Home';
const BottomTab = createMaterialBottomTabNavigator();

const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
      initialRouteName={"Home"}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="VoteDetails" component={VoteDetailsScreen} />
    </HomeStack.Navigator>
  );
}

const SearchStack = createStackNavigator();
function SearchStackScreen() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="SearchSeries" component={SearchSeriesScreen} />
      <SearchStack.Screen name="SearchCharacters" component={SearchCharactersScreen} />
      <SearchStack.Screen name="SubmitCharacter" component={SubmitCharacterScreen} />
    </SearchStack.Navigator>
  );
}

const ProfileStack = createStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="CharDetails" component={CharDetailsScreen} />
      <ProfileStack.Screen name="ViewTrade" component={ViewTradeScreen} />
    </ProfileStack.Navigator>
  );
}

const TradeStack = createStackNavigator();
function TradeStackScreen() {
  return (
    <TradeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <TradeStack.Screen name="Trade" component={TradeScreen} />
      <TradeStack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} />
      <TradeStack.Screen name="OtherUserCharDetails" component={OtherUserCharDetailsScreen} />
      <TradeStack.Screen name="NewTrade" component={NewTradeScreen} />
      <TradeStack.Screen name="ViewTrade" component={ViewTradeScreen} />
    </TradeStack.Navigator>
  );
}

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html

  return (
    <NavigationContainer>
      <BottomTab.Navigator
        initialRouteName={INITIAL_ROUTE_NAME}
        renderTouchable
        barStyle={{ backgroundColor: 'white', borderTopColor: chroma('aqua').hex(), borderTopWidth: 2}}
        keyboardHidesNavigationBar
        labeled={false}
      >
        <BottomTab.Screen name="Profile"
          component={ProfileStackScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="user" />,
          }}
        />
        <BottomTab.Screen name="Home"
          component={HomeStackScreen}
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="home" />,
          }}
        />
        <BottomTab.Screen name="Search"
          component={SearchStackScreen}
          options={{
            title: 'Search',
            tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="search" />,
          }}
        />
        <BottomTab.Screen name="Trade"
          component={TradeStackScreen}
          options={{
            title: 'Trade',
            tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="exchange-alt" />,
          }}
        />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
}