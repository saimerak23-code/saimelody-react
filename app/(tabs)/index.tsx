import songJson from "@/assets/saisongs.json";
import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SongViewer from "@/components/SongViewer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ApiUrl, FormatDate } from "@/constants/common";
import { IEvent } from "@/dbmodels/ievent";
import { iEventProfile } from "@/dbmodels/ieventprofile";
import { IFav } from "@/dbmodels/ifav";
import { iProfile } from "@/dbmodels/iprofile";
import { SaiSongHist } from "@/dbmodels/isong";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fuse from "fuse.js";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  Card,
  Icon,
  MD3Colors,
  RadioButton,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function HomeScreen() {
  const options = {
    includeScore: true,
    includeMatches: true,
    threshold: 0.2,
    keys: ["Title", "Lyrics"],
  };
  const fuse = new Fuse<SaiSongHist>(songJson, options);
  const theme = useTheme(); // Access the theme object
  const { colors, fonts } = theme;
  const [text, setText] = useState("");
  const [count, setCount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fullScreenView, setFullScreenView] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [viewSong, setViewSong] = useState(false);
  const [song, setSong] = useState<SaiSongHist>();
  const [songs, setSongs] = useState<SaiSongHist[]>();
  const [recentSearches, setRecentSearches] = useState<IFav[]>();
  const [recentSongs, setRecentSongs] = useState<IFav[]>();
  const [visible, setVisible] = useState(false);
  const [eventId, setEventId] = useState("");
  const [scale, setScale] = useState("");
  const containerStyle = { backgroundColor: "white", padding: 20, height: 300 };
  const SCORE_THRESHOLD = 0.6;
  const [loading, setLoading] = useState(false);
  const aUrl = ApiUrl;
  const [eventProfile, setEventProfile] = useState<iEventProfile>();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const noProfile: iProfile = {
    username: "",
    email: "",
    centerId: "",
    centerName: "",
    profileSet: false,
    officer: false,
  };
  const onSearch = async () => {
    try {
      setIsLoading(true);
      await delay(100);
      console.log(text);
      const s: SaiSongHist[] = fuse
        .search(text)
        .filter((fuseResult) => fuseResult.score ?? 0 < SCORE_THRESHOLD)
        .sort((a, b) => b.score ?? 0 - (a.score ?? 0))
        .slice(0, 10)
        .map((result) => result.item);
      setCount("Showing " + s.length.toString() + " songs");
      setSongs(s);
      setIsLoading(false);
    } catch (error) {
      // Code to handle the error
      console.log("An error occurred:", error);
      // You might display a user-friendly message or log to an error tracking service
    }
  };
  const onClear = async () => {
    await delay(100);
    setCount("clearing ...");
    setSongs([]);
    await delay(100);
    setCount("");
    setIsLoading(false);
  };
  const onViewSong = async (id: string) => {
    const s: SaiSongHist = songJson.filter((result) => result.SongId == id)[0];
    const rSong: IFav = {
      SongId: s.SongId,
      Title: s.Title,
    };
    let rSongs: IFav[] = [];
    if (recentSongs === undefined || recentSongs.length == 0) {
      rSongs.push(rSong);
    } else {
      rSongs = recentSongs;
      if (
        rSongs.filter((result) => result.SongId == rSong.SongId).length == 0
      ) {
        rSongs.push(rSong);
      }
    }
    setRecentSongs(rSongs);
    await AsyncStorage.setItem("recentsong", JSON.stringify(rSongs));
    setSong(s);
    setFullScreenView(true);
    setViewSong(true);
    setSignUp(false);
  };
  const onSignUpSong = async (song: SaiSongHist) => {
    setSong(song);
    setFullScreenView(true);
    setViewSong(false);
    setSignUp(true);
  };

  const onCloseSong = () => {
    setFullScreenView(false);
  };

  const addFav = async (song: SaiSongHist) => {
    try {
      const songFav: IFav = {
        SongId: song.SongId,
        Title: song.Title,
      };
      const jsonValue = await AsyncStorage.getItem("saifav");
      if (jsonValue != null) {
        const jsonarr: IFav[] = JSON.parse(jsonValue);
        jsonarr.push(songFav);
        await AsyncStorage.setItem("saifav", JSON.stringify(jsonarr));
      } else {
        const favArr: IFav[] = [];
        favArr.push(songFav);
        await AsyncStorage.setItem("saifav", JSON.stringify(favArr));
      }
      Alert.alert(
        "Favorites added successfully",
        song.Title,
        [{ text: "OK", onPress: () => setVisible(false) }] // Optional manual close
      );
      setTimeout(() => {
        setVisible(false); // Hide the alert
      }, 2000);
    } catch (e) {
      console.log(e);
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("saiprofile");
      const prof: iProfile = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (prof == null || !prof.profileSet) {
        const arr: IEvent[] = [];
        const result: iEventProfile = {
          events: arr,
          profile: noProfile,
        };
        setEventProfile(result);
        return result;
      }
      const url = aUrl + "/event/getevents?centerId=" + prof.centerId;
      console.log(url);
      const response = await fetch(url, {
        method: "GET", // or POST, PUT, etc.
        headers: new Headers({
          "ngrok-skip-browser-warning": "true", // The value can be anything
        }),
      });
      const json: IEvent[] = await response.json();
      const result: iEventProfile = {
        events: json,
        profile: prof,
      };
      return result;
    } catch (error) {
      const arr: IEvent[] = [];
      const result: iEventProfile = {
        events: arr,
        profile: noProfile,
      };
      return result;
    }
  };

  const getRecents = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("recentsong");
      const rSongs: IFav[] = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (rSongs == null || rSongs.length == 0) {
        const arr: IFav[] = [];
        setRecentSongs(arr);
        return arr;
      }
      const sSongs: IFav[] = rSongs.sort((a, b) =>
        a.Title.localeCompare(b.Title)
      );
      setRecentSongs(sSongs);
      return rSongs;
    } catch (error) {
      const arr: IFav[] = [];
      setRecentSearches(arr);
      return arr;
    }
  };

  const getDataAsync = async () => {
    getRecents()
      .then((res) => {
        console.log(res);
        setRecentSongs(res);
      })
      .catch((err) => {});
    getData()
      .then((res) => {
        console.log(res);
        setEventProfile(res);
        setLoading(true);
      })
      .catch((err) => {
        setLoading(true);
      });
  };

  const handleValueChange = (newValue: string) => {
    setEventId(newValue);
  };

  const onChangeScale = async (s: string) => {
    setScale(s);
  };

  const handleSignUp = async () => {
    if (eventId === "") {
      Alert.alert("Error", "Please select an event.");
      return;
    }
    try {
      const evt = {
        SongId: song?.SongId,
        EventId: eventId,
        CenterId: eventProfile?.profile.centerId,
        SongTitle: song?.Title,
        SongLyrics: song?.Lyrics,
        SongMeaning: song?.Meaning,
        SungByName: eventProfile?.profile.username,
        SungByEmail: eventProfile?.profile.email,
        Scale: scale,
        SongOrder: 0,
      };
      console.log(evt);
      const url = aUrl + "/song/addsong";
      const response = await fetch(url, {
        method: "POST", // or POST, PUT, etc.
        headers: new Headers({
          "ngrok-skip-browser-warning": "true", // The value can be anything
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(evt),
      });
      const result = await response.json();
      if (result) {
        Alert.alert("Success", "Song submitted Succewssfully");
        setFullScreenView(false);
      } else {
        Alert.alert("Error", "Please reach out to Support");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(true);
  };

  useEffect(() => {
    if (!loading) {
      getData()
        .then((res) => {
          console.log(res);
          setEventProfile(res);
          setLoading(true);
        })
        .catch((err) => {
          setLoading(true);
        });
      getRecents()
        .then((res) => {
          console.log(res);
          setRecentSongs(res);
        })
        .catch((err) => {});
    }
  }, [eventProfile]);

  return !fullScreenView ? (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/sathyasai-singing.jpg")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="subtitle">Sai Bhajans</ThemedText>
        <Icon source="music-note" size={25} color={MD3Colors.neutral60} />
      </ThemedView>

      <View style={{ padding: 5 }}>
        <Searchbar
          style={{ marginBottom: 10 }}
          placeholder="search for bhajans here"
          onChangeText={(newText) => setText(newText)}
          value={text}
          onSubmitEditing={onSearch}
        />
        <View style={styles.srchbuttons}>
          <View>
            <Button onPress={onSearch} mode="contained" style={styles.srchbtn}>
              Search
            </Button>
          </View>
          <View>
            <Button onPress={onClear} mode="contained" style={styles.srchbtn}>
              Clear
            </Button>
          </View>
        </View>
        <View style={styles.recentSongs}>
          <Collapsible title="Recent Songs">
            <Card>
              {recentSongs?.map((fav, index) => (
                <View key={index}>
                  <Button onPress={() => onViewSong(fav.SongId)} mode="text">
                    {fav.Title}
                  </Button>
                </View>
              ))}
            </Card>
          </Collapsible>
        </View>
        {isLoading && (
          <ActivityIndicator
            style={{ height: 80 }}
            color="purple"
            size="large"
          />
        )}
      </View>
      <SafeAreaView>
        <View style={{ marginLeft: 10 }}>
          <ThemedText style={styles.showingCount}>{count}</ThemedText>
        </View>
        <ScrollView>
          <ThemedView style={styles.srchresults}>
            {songs?.map((song) => (
              <Card key={song.SongId} style={styles.cardSong}>
                <Card.Content>
                  <Text style={styles.cardLyrics}>{song.Lyrics}</Text>
                </Card.Content>
                <Card.Actions style={{ paddingTop: 0 }}>
                  <Button
                    compact={true}
                    mode="text"
                    onPress={() => onViewSong(song.SongId)}
                  >
                    View
                  </Button>
                  <Button
                    compact={true}
                    mode="text"
                    onPress={() => onSignUpSong(song)}
                  >
                    Sign Up
                  </Button>
                  <Button
                    compact={true}
                    mode="text"
                    onPress={() => addFav(song)}
                  >
                    <Icon source="star-outline" size={20} />
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ParallaxScrollView>
  ) : viewSong && fullScreenView ? (
    <ScrollView>
      <View style={{ width: "100%", height: "100%" }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onCloseSong} />
          <Appbar.Content title={song?.Title} />
        </Appbar.Header>
        <SongViewer songId={(song?.SongId ?? "").toString()}></SongViewer>
      </View>
    </ScrollView>
  ) : signUp && fullScreenView ? (
    <ScrollView>
      <View style={{ width: "100%", height: "100%" }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onCloseSong} />
          <Appbar.Content title={song?.Title} />
        </Appbar.Header>
        <View style={{ padding: 15, margin: 10 }}>
          <ThemedText style={styles.signUpviewlyrics}>
            {song?.Lyrics}
          </ThemedText>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.fullviewmeaning}>{song?.Meaning}</Text>
          </View>
          <View>
            <ThemedText style={styles.signupLabel}>Scale: </ThemedText>
            <TextInput
              value={scale}
              style={styles.textInput}
              onChangeText={(text) => onChangeScale(text)}
            />
          </View>
          <View>
            <ThemedText style={styles.signupLabel}>
              Select Event: Center - {eventProfile?.profile.centerName}
            </ThemedText>
            <Button compact={true} mode="text" onPress={() => getDataAsync()}>
              <ThemedText> Don't see my Events?</ThemedText>
              <Icon source="refresh" size={20} color={MD3Colors.neutral60} />
            </Button>
            <ScrollView style={styles.scrollView}>
              <RadioButton.Group
                onValueChange={handleValueChange}
                value={eventId}
              >
                {loading &&
                  eventProfile?.events.map((item, index) => (
                    <RadioButton.Item
                      key={index}
                      label={item.eventName + " " + FormatDate(item.eventDate)}
                      value={item.eventId}
                      style={styles.fullviewradio}
                    />
                  ))}
              </RadioButton.Group>
            </ScrollView>
            <Button
              compact={true}
              mode="contained"
              onPress={handleSignUp}
              style={styles.submitSongBtn}
            >
              Submit
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  ) : (
    <View></View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    textAlign: "center",
    fontWeight: "normal",
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "bold",
    color: "#494F55",
    marginRight: 10,
  },
  srchresults: {},
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 250,
    width: 400,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  showingCount: {
    fontWeight: "500",
  },
  cardSong: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: "whitesmoke",
    marginBottom: 10,
  },
  cardLyrics: {
    margin: 0,
  },
  srchbuttons: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    justifyContent: "center",
  },
  srchbtn: {
    borderRadius: 10,
    marginRight: 10,
  },
  fullviewlyrics: {
    fontSize: 18,
    padding: 10,
    paddingBottom: 0,
  },
  signUpviewlyrics: {
    fontSize: 14,
    padding: 10,
    paddingBottom: 0,
  },
  fullviewlabelvalue: {
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  fullviewmeaning: {
    fontSize: 16,
    margin: 5,
    marginTop: 0,
    padding: 15,
    backgroundColor: "whitesmoke",
    borderRadius: 10,
    fontStyle: "italic",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "lightgrey",
  },
  fullviewlabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 15,
  },
  fullviewvalue: {
    fontSize: 16,
  },
  fullviewradio: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 5,
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 5,
    width: "95%",
    backgroundColor: "whitesmoke",
    fontSize: 12,
  },
  scrollView: {
    padding: 5,
    height: 200,
    borderColor: "lightgrey",
    borderStyle: "solid",
    borderWidth: 1,
  },
  submitSongBtn: {
    marginTop: 20,
    marginBottom: 200,
  },
  textInput: {
    borderColor: "lightgray",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "white",
  },
  signupLabel: {
    paddingTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  recentSongs: {
    marginTop: 10,
  },
});
