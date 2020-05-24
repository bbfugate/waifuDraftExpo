import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import watch from "redux-watch";
import _ from "lodash";
import lz from "lz-string";
import { getSearchData } from '../redux/actions/dataActions';

/* import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import SearchTeams from "../components/SearchTeams";
import SearchUniverses from "../components/SearchUniverses"; */

// Redux stuff
import store from "../redux/store";

const { width, height } = Dimensions.get('window');
export default class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: store.getState().UI.loading,
      searchItems: store.getState().data.searchItems,
      waifuList: store.getState().data.waifuList,
      tabIndex: 1,
      view: "",
      viewSelected: false,
      cards: [
        {
          id: 1,
          name: "Anime/Manga",
          view: "Anime-Manga",
          raised: false,
          img:
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/73b4b114-acd6-4484-9daf-599a5af85479/d2xp0po-60c4012a-a71f-48bf-a560-4d8f90c7f95d.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzczYjRiMTE0LWFjZDYtNDQ4NC05ZGFmLTU5OWE1YWY4NTQ3OVwvZDJ4cDBwby02MGM0MDEyYS1hNzFmLTQ4YmYtYTU2MC00ZDhmOTBjN2Y5NWQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.k24BMIyLR_76OgLMG_YL_TZV_IIHObYS8Kx4m5qq-Hk",
        },
        {
          id: 2,
          name: "Marvel",
          view: "Marvel",
          raised: false,
          img:
            "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Marvel%20Covers%2FStorm.jpg?alt=media&token=0fed365b-921d-4cb9-922c-fd0beec2784b",
        },
        {
          id: 3,
          name: "DC",
          view: "DC",
          raised: false,
          img:
            "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/DC%20Covers%2Fwonderwoman.jpg?alt=media&token=dd8e28ea-c3b6-4b33-9382-96b67086e009",
        },
      ],
    };

    this.switchViews = this.switchViews.bind(this);
    this.closeView = this.closeView.bind(this);
    this.raiseCard = this.raiseCard.bind(this);

    let dataReducerWatch = watch(store.getState, 'data')
    let uiReducerWatch = watch(store.getState, 'UI')

    store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ ...newVal })
    }))
    
    store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ ...newVal })
    }))
  }

  async componentDidMount() {
    if (_.isEmpty(this.state.searchItems)) {
      getSearchData();
    }
  }

  async switchViews(view) {
    var cards = this.state.cards;
    cards.forEach((card) => {
      card.raised = false;
    });

    this.setState({ viewSelected: view, view, cards });
  }

  raiseCard(id, raised) {
    var cards = this.state.cards;
    var card = cards.filter((x) => x.id == id)[0];
    card.raised = raised;
    this.setState({ cards });
  }

  closeView() {
    this.setState({ viewSelected: false });
  }

  render() {
    return (
      <View style={styles.container}>
        <Button disabled={this.state.loading} mode="contained" onPress={() => console.log(this.state.searchItems)}>
          Show Search Results
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor:"transparent"
  },
  text: {
    color: "grey",
    fontSize: 30,
    fontWeight: "bold"
  }
})
