import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView} from 'react-native';
import { Text, Button, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';

//Screens
import ChatScreen from '../screens/Chat';
import ViewChatScreen from '../screens/ViewChat';
import NewChatScreen from '../screens/NewChat';

import ProfileScreen from '../screens/Profile';

import TradeScreen from '../screens/Trade';
import OtherUserProfileScreen from '../screens/OtherUserProfile';
import OtherUserCharDetailsScreen from '../screens/OtherUserCharDetails';
import NewTradeScreen from '../screens/NewTrade';
import ViewTradeScreen from '../screens/ViewTrade';

import HomeScreen from '../screens/Home';
import VoteDetailsScreen from '../screens/VoteDetails';
import CharDetailsScreen from '../screens/CharDetails';

import GauntletScreen from '../screens/Gauntlet';
import BossFightScreen from '../screens/BossFight';

import SearchScreen from '../screens/Search';
import SearchSeriesScreen from '../screens/SearchSeries';
import SearchCharactersScreen from '../screens/SearchCharacters';
import SubmitCharacterScreen from '../screens/SubmitCharacter';
import ViewWishListCharactersScreen from '../screens/ViewWishListCharacters';
import UserWaifuFavoritesScreen from '../screens/UserWaifuFavorites';

import ShopScreen from '../screens/Shop';
import BuyWaifuScreen from '../screens/BuyWaifu';

const homeIcon = require('../assets/images/HomeIcon.png')
const bossIcon = require('../assets/images/atkIcon.png')

//Chroma
const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

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
      <SearchStack.Screen name="ViewWishListCharacters" component={ViewWishListCharactersScreen} />
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
      <ProfileStack.Screen name="OtherUserCharDetails" component={OtherUserCharDetailsScreen} />
      <ProfileStack.Screen name="ViewTrade" component={ViewTradeScreen} />
      <ProfileStack.Screen name="SubmitCharacter" component={SubmitCharacterScreen} />
      <ProfileStack.Screen name="UserWaifuFavorites" component={UserWaifuFavoritesScreen} />
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
      <TradeStack.Screen name="CharDetails" component={CharDetailsScreen} />
      <TradeStack.Screen name="OtherUserCharDetails" component={OtherUserCharDetailsScreen} />
      <TradeStack.Screen name="NewTrade" component={NewTradeScreen} />
      <TradeStack.Screen name="ViewTrade" component={ViewTradeScreen} />
      <TradeStack.Screen name="ViewChat" component={ViewChatScreen} />
      <ProfileStack.Screen name="SubmitCharacter" component={SubmitCharacterScreen} />
      <ProfileStack.Screen name="UserWaifuFavorites" component={UserWaifuFavoritesScreen} />
    </TradeStack.Navigator>
  );
}

const GauntletStack = createStackNavigator();
function GauntletStackScreen() {
  return (
    <GauntletStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <GauntletStack.Screen name="Gauntlet" component={GauntletScreen} />
      <GauntletStack.Screen name="BossFight" component={BossFightScreen} />
    </GauntletStack.Navigator>
  );
}

const ShopStack = createStackNavigator();
function ShopStackScreen() {
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <ShopStack.Screen name="Shop" component={ShopScreen} />
      <ShopStack.Screen name="BuyWaifu" component={BuyWaifuScreen} />
    </ShopStack.Navigator>
  );
}

const ChatStack = createStackNavigator();
function ChatStackScreen() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <ChatStack.Screen name="Chat" component={ChatScreen} />
      <ChatStack.Screen name="ViewChat" component={ViewChatScreen} />
      <ChatStack.Screen name="NewChat" component={NewChatScreen} />
    </ChatStack.Navigator>
  );
}

export default function BottomTabNavigator({ navigation, route }) {
  return (
    <NavigationContainer>
      <BottomTab.Navigator
        initialRouteName={INITIAL_ROUTE_NAME}
        renderTouchable
        // activeColor="#fff"
        // inactiveColor="#000"
        keyboardHidesNavigationBar
        labeled={false}
      >
        <BottomTab.Screen name="Profile"
          component={ProfileStackScreen}
          options={{
            title: 'Profile',
            tabBarColor: chroma('aqua').darken(.25).hex(),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="user" />,
          }}
        />

        <BottomTab.Screen name ="Chats"
          component={ChatStackScreen}
          options={{
            title: "Chats",
            tabBarColor: "white",
            tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="message-text-outline" size={24} color={focused ? "black" : "#ccc"} />,
          }}
        >

        </BottomTab.Screen>

        <BottomTab.Screen name="Trade"
          component={TradeStackScreen}
          options={{
            title: 'Trade',
            tabBarColor: chroma('silver').hex(),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="exchange-alt" />,
          }}
        />
        
        <BottomTab.Screen name="Home"
          component={HomeStackScreen}
          options={{
            title: 'Home',
            tabBarColor: "black",
            tabBarIcon: ({ focused }) =>
            // <View style={{flex:1, alignItems: "center", justifyContent:"center"}}>
              // {/* <Image source={homeIcon} style={{height:65, width:65, position:"absolute", alignSelf:"center"}} /> */}
              <TabBarIcon focused={focused} activeColor='white' name="home" style={{position:"absolute", alignSelf:"center"}}  />
            // </View>
            ,
          }}
        />
        
        <BottomTab.Screen name="Shop"
          component={ShopStackScreen}
          options={{
            title: 'Shop',
            tabBarColor: chroma('green').brighten().hex(),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="dollar-sign" />,
          }}
        />
        <BottomTab.Screen name="Gauntlet"
          component={GauntletStackScreen}
          options={{
            title: 'Gauntlet',
            tabBarColor: chroma('rgba(255,149,0,1)'),
            tabBarIcon: ({ focused }) => <Image style={{height: 30, width: 30, tintColor: !focused ? '#ccc' : 'white'}} source={bossIcon} />,
          }}
        />
        <BottomTab.Screen name="Search"
          component={SearchStackScreen}
          options={{
            title: 'Search',
            tabBarLabel: "Search",
            tabBarColor: chroma('aquamarine').luminance(0.5),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="search" />,
          }}
        />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
}