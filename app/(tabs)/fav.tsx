import songJson from "@/assets/saisongs.json";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SongViewer from "@/components/SongViewer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IFav } from "@/dbmodels/ifav";
import { SaiSongHist } from "@/dbmodels/isong";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar, Button, Card, Icon, MD3Colors } from "react-native-paper";

export default function FavScreen() {
  const [favs, setFavs] = useState<IFav[]>();
  const [song, setSong] = useState<SaiSongHist>();
  const [loading, setLoading] = useState(false);
  const [fullScreenView, setFullScreenView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onViewSong = async (id: string) => {
    const s: SaiSongHist = songJson.filter((result) => result.SongId == id)[0];
    setSong(s);
    setFullScreenView(true);
  };

  const onCloseSong = () => {
    setFullScreenView(false);
  };

  const showConfirmationRemove = async (idToRemove: string) => {
    Alert.alert(
      "Favorites", // Title of the alert
      "Are you sure you want to remove this bhajan from favorites?", // Message of the alert
      [
        {
          text: "Cancel", // Text for the first button
          onPress: () => console.log("ok"), // Callback when Cancel is pressed
          style: "cancel", // Style for the button (e.g., 'cancel', 'destructive', 'default')
        },
        {
          text: "Confirm", // Text for the second button
          onPress: () => removeFav(idToRemove), // Callback when Confirm is pressed
        },
      ],
      { cancelable: false } // Optional: prevents dismissing by tapping outside the alert (Android only)
    );
  };

  const removeFav = async (idToRemove: string) => {
    try {
      const newArr = favs?.filter((item) => item.SongId !== idToRemove);
      await AsyncStorage.setItem("saifav", JSON.stringify(newArr));
      setLoading(false);
      getDataSync();
    } catch (e) {
      // saving error
    }
  };
  const getData = async () => {
    try {
      console.log("sai maa");
      const jsonValue = await AsyncStorage.getItem("saifav");
      const arr: IFav[] = jsonValue != null ? JSON.parse(jsonValue) : null;
      const sarr: IFav[] = arr.sort((a, b) => a.Title.localeCompare(b.Title));
      setFavs(sarr);
      return sarr;
    } catch (e) {
      console.log(e);
      const arr: IFav[] = [];
      return arr;
    }
  };

  useEffect(() => {
    if (!loading) {
      getData()
        .then((res) => {
          setFavs(res);
          setLoading(true);
        })
        .catch((err) => {
          setLoading(true);
        });
    }
  }, [favs]);

  function getDataSync() {
    getData()
      .then((res) => {
        console.log(res, "it worked");
        setFavs(res);
      })
      .catch((err) => {
        setLoading(true);
        console.log(err);
      });
  }

  return !fullScreenView ? (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("@/assets/images/sathyasai-singing.jpg")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Favorites</ThemedText>
        <Button compact={true} mode="text" onPress={() => getDataSync()}>
          <Icon source="refresh" size={20} color={MD3Colors.neutral60} />
        </Button>
      </ThemedView>
      <View>
        {!loading ? (
          <View>
            <Text> No Data</Text>
          </View>
        ) : (
          favs?.map((item, index) => (
            <Card style={styles.cardContainer} key={index}>
              <View>
                <View>
                  <Text>
                    {index + 1}. {item.Title}
                  </Text>
                </View>
                <View style={styles.favcontainer}>
                  <Button
                    mode="text"
                    style={styles.favcolumna}
                    onPress={() => onViewSong(item.SongId)}
                  >
                    View
                  </Button>
                  <Button
                    mode="text"
                    style={styles.favcolumnb}
                    onPress={() => showConfirmationRemove(item.SongId)}
                  >
                    Remove
                  </Button>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
      <View>
        <Button compact={true} mode="text" onPress={() => getDataSync()}>
          <Text> Don't see all my favorites?</Text>
          <Icon source="refresh" size={20} />
        </Button>
      </View>
    </ParallaxScrollView>
  ) : (
    <ScrollView>
      <View style={{ width: "100%", height: "100%" }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onCloseSong} />
          <Appbar.Content title={song?.Title} />
        </Appbar.Header>
        <SongViewer songId={(song?.SongId ?? "").toString()}></SongViewer>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 250,
    width: 400,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 2,
  },
  scrollView: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  itemContainer: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#444",
  },
  favcontainer: {
    flexDirection: "row", // Arranges items horizontally
    padding: 0,
  },
  favcolumna: {
    padding: 0,
    margin: 0,
    fontWeight: "normal",
  },
  favcolumnb: {
    padding: 0,
    alignItems: "center",
    fontWeight: "normal",
  },
  cardContainer: {
    paddingLeft: 10,
    paddingTop: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
});
