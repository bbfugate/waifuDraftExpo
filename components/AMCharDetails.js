import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import Swiper from 'react-native-swiper'

import _ from 'lodash';
const chroma = require('chroma-js')

function Row({ item, index }) {
  var styleRow = index % 2 == 0 ? styles.rowEven : styles.rowOdd;

  return (
    <View style={[styleRow, {flex: 1}]}>
      <Text style={[styles.text, {fontSize: 25}]}>{item}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text:{
    textAlign:"center",
    fontFamily:"Edo",
  },
  rowOdd:{
    backgroundColor: "rgba(255,255,255,.025)",
    marginBottom: 5
  },
  rowEven:{
    backgroundColor: "rgba(0,0,0,.025)",
    marginBottom: 5
  },
  nameView:{
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.75)",
  },
  titleView:{
    height: 50,
    backgroundColor: chroma('black').alpha(.05),
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 1
  },
  titleShadow:{
    textShadowColor: chroma('red').brighten().hex(),
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  nameText:{
    color:"white"
  },
  tagsView:{

  },
  quoteView:{
    flex:1,
    backgroundColor:"rgba(255,255,255,.75)",
    justifyContent: "center",
    alignItems: "center"
  },
  quote:{
    flex: 1,
    textAlign:"center",
    fontFamily:"Edo",
    fontSize: 18,
    margin: 0,
  }
});

const { width, height } = Dimensions.get('window');
const AMCharDetails = ({ card }) => {
  //Anime-Manga Variables
  const tags = card.tags.concat(card.traits);
  const [detailViewHeight, setDetailViewHeight] = React.useState(height);
  const onLayout = (e) => {
    //setDetailViewHeight(e.nativeEvent.layout.height)
  }

  return(
    <View style={styles.container}>
      {/* <Swiper
        index={0}
        horizontal={false}
        showsPagination={false}
        removeClippedSubviews
        automaticallyAdjustContentInsets
        bounces
        loadMinimal
      > */}

        <View style={styles.container} onLayout={onLayout}>
          {/* Name */}
          <View style={styles.nameView}>
            <Text style={[styles.text,styles.nameText, styles.titleShadow,{fontSize: 45}]}>{card.name}</Text>
          </View>

          {/* Tags */}
          {/* <View style={{height: 150}}>
            <View  style={{height: 50}}>
              <Text style={{fontFamily:"Edo", fontSize: 30, textAlign:"center"}}>Characteristics</Text>
            </View>
            <View style={{height: 100, alignItems:"center", justifyContent:"center", flexDirection: "row"}}>
              {tags.map(x => {
                return(
                  <Text key={x} style={[styles.text]}>{x}</Text>
                )
              })}
            </View>
          </View> */}

          {/* Appearances */}
          <View style={{height: detailViewHeight - 75}}>
            <View style={{flex:1}}>
              <View style={styles.titleView}>
                <Text style={[styles.text, styles.titleShadow,{fontSize: 40, color:"white"}]}>Animes</Text>
              </View>
              <View style={{flex:1}}>
                <FlatList
                  data={card.animes}
                  renderItem={({ item, index }) => <Row item={item} index={index} />}
                  keyExtractor={item => item}
                />
              </View>
            </View>

            <View style={{flex:1}}>
              <View style={styles.titleView}>
                <Text style={[styles.text, styles.titleShadow, {fontSize: 40, color:"white"}]}>Mangas</Text>
              </View>
              <View style={{flex:1}}>
                <FlatList
                  data={card.mangas}
                  renderItem={({ item, index }) => <Row item={item} index={index} />}
                  keyExtractor={item => item}
                />
              </View>
            </View>
          </View>
        </View>
      
      {/*         
        {card.quote != "" ?
          <View style={styles.quoteView}>
            <Text style={styles.quote}>
              {card.desc}
            </Text>
          </View>
          :
          <></>
        }

      </Swiper> */}
    </View>
  );
}

export default AMCharDetails;