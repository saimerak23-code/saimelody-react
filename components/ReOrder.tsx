import { ApiUrl } from "@/constants/common";
import { IEvent } from "@/dbmodels/ievent";
import { ISongOrder } from "@/dbmodels/isongorder";
import { ISongSignUp } from "@/dbmodels/isongsign";
import React, { memo, PropsWithChildren, useState } from "react";
import {
  Alert,
  ListRenderItemInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Appbar, Button, Card, TextInput } from "react-native-paper";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from "react-native-reorderable-list";

const aUrl = ApiUrl;

type Props = PropsWithChildren<{
  songs: ISongSignUp[];
  event: IEvent;
  centerId: string;
  refreshSong: (ev: IEvent) => void;
}>;

export default function ReOrder({
  songs,
  event,
  centerId,
  refreshSong,
}: Props) {
  const [data, setData] = useState(songs);
  const [song, setSong] = useState<ISongSignUp>({
    songId: 0,
    eventId: event.eventId,
    centerId: centerId,
    songTitle: "",
    songLyrics: "",
    songMeaning: "",
    sungByName: "",
    sungByEmail: "",
    scale: "",
    songOrder: 0,
  });
  const [fullScreenView, setFullScreenView] = useState(false);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [meaning, setMeaning] = useState("");
  const [sungByName, setSungByName] = useState("");
  const [sungByEmail, setSungByEmail] = useState("");
  const [scale, setScale] = useState("");
  const [isReorder, setIsReorder] = useState(false);

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    setData((value) => reorderItems(value, from, to));
    setIsReorder(true);
  };

  const onViewSong = async (s: ISongSignUp) => {
    setSong(s);
    setTitle(s.songTitle);
    setLyrics(s.songLyrics);
    setMeaning(s.songMeaning);
    setSungByName(s.sungByName);
    setSungByEmail(s.sungByEmail);
    setScale(s.scale);
    setFullScreenView(true);
  };

  const onCloseSong = () => {
    setFullScreenView(false);
  };

  const onChangeLyrics = async (s: string) => {
    setLyrics(s);
    setSong({ ...song, songLyrics: s });
  };

  const onChangeMeaning = async (s: string) => {
    setMeaning(s);
    setSong({ ...song, songMeaning: s });
  };

  const onChangeSungByName = async (s: string) => {
    setSungByName(s);
    setSong({ ...song, sungByName: s });
  };

  const onChangeSungByEmail = async (s: string) => {
    setSungByEmail(s);
    setSong({ ...song, sungByEmail: s });
  };

  const onChangeScale = async (s: string) => {
    setScale(s);
    setSong({ ...song, scale: s });
  };

  const onChangeTitle = async (s: string) => {
    setTitle(s);
    setSong({ ...song, songTitle: s });
  };

  const showConfirmationRemove = async (s: ISongSignUp) => {
    Alert.alert(
      "Sign Up", // Title of the alert
      "Are you sure you want to remove this bhajan from Sign Up?", // Message of the alert
      [
        {
          text: "Cancel", // Text for the first button
          onPress: () => console.log("ok"), // Callback when Cancel is pressed
          style: "cancel", // Style for the button (e.g., 'cancel', 'destructive', 'default')
        },
        {
          text: "Confirm", // Text for the second button
          onPress: () => handleSignUp(s, false), // Callback when Confirm is pressed
        },
      ],
      { cancelable: false } // Optional: prevents dismissing by tapping outside the alert (Android only)
    );
  };

  const CardSong: React.FC<ISongSignUp> = memo((song) => {
    const drag = useReorderableDrag();

    return (
      <Pressable style={[styles.card]} onLongPress={drag}>
        <Card>
          <Text style={[styles.text]}>{song.songTitle}</Text>
          <View>
            <Text style={[styles.sungby]}>Singer: {song.sungByName}</Text>
          </View>
          <View style={styles.favcontainer}>
            <Button
              mode="text"
              style={styles.favcolumna}
              onPress={() => onViewSong(song)}
            >
              Edit
            </Button>
            <Button
              mode="text"
              style={styles.favcolumnb}
              onPress={() => showConfirmationRemove(song)}
            >
              Remove
            </Button>
          </View>
        </Card>
      </Pressable>
    );
  });
  const renderItem = ({ item }: ListRenderItemInfo<ISongSignUp>) => (
    <CardSong {...item} />
  );

  const handleOrder = async () => {
    const sorders: ISongOrder[] = [];
    let index = 0;
    data.forEach((element) => {
      index = index + 1;
      const sorder: ISongOrder = {
        SongId: element.songId.toString(),
        SongOrder: index,
      };
      sorders.push(sorder);
    });
    const url =
      aUrl +
      "/song/OrderSong?eventId=" +
      event.eventId +
      "&centerId=" +
      centerId;
    const response = await fetch(url, {
      method: "POST", // or POST, PUT, etc.
      headers: new Headers({
        "ngrok-skip-browser-warning": "true", // The value can be anything
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(sorders),
    });
    const result = await response.json();
    console.log(result);
    if (result) {
      Alert.alert("Success", "Song Reordered Successfully");
    } else {
      Alert.alert("Error", "Please reach out to Support");
    }
    setIsReorder(false);
  };

  const handleSignUp = async (s: ISongSignUp, isedit: boolean) => {
    try {
      const url = aUrl + (isedit ? "/song/editsong" : "/song/deletesong");
      const response = await fetch(url, {
        method: "POST", // or POST, PUT, etc.
        headers: new Headers({
          "ngrok-skip-browser-warning": "true", // The value can be anything
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(s),
      });
      const result = await response.json();
      if (result) {
        Alert.alert("Success", "Song updated Successfully");
        refreshSong(event);
        setFullScreenView(false);
      } else {
        Alert.alert("Error", "Please reach out to Support");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return !fullScreenView ? (
    <GestureHandlerRootView style={styles.container}>
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        scrollEnabled={false}
        // IMPORTANT: Do not use the current index as key.
        // Always use a stable and unique key for each item.
        keyExtractor={(item) => item.songId.toString()}
      />
      <Button
        onPress={handleOrder}
        mode="contained"
        style={styles.saveButton}
        disabled={!isReorder}
      >
        Save Order
      </Button>
    </GestureHandlerRootView>
  ) : (
    <ScrollView>
      <View style={{ width: "100%", height: "100%" }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onCloseSong} />
          <Appbar.Content title={song?.songTitle} />
        </Appbar.Header>
        <View>
          <Text style={styles.signupLabel}>Title: </Text>
          <TextInput
            value={title}
            style={styles.textInput}
            onChangeText={(text) => onChangeTitle(text)}
          />
        </View>
        <View>
          <Text style={styles.signupLabel}>Lyrics: </Text>
          <TextInput
            style={styles.textArea}
            multiline={true}
            numberOfLines={8} // Suggests an initial height of 4 lines
            placeholder="Enter your multi-line text here..."
            textAlignVertical="top" // Aligns text to the top
            value={lyrics}
            onChangeText={(text) => onChangeLyrics(text)}
          />
        </View>
        <View>
          <Text style={styles.signupLabel}>Meaning: </Text>
          <TextInput
            style={styles.textArea}
            multiline={true}
            numberOfLines={5} // Suggests an initial height of 4 lines
            placeholder="Enter your multi-line text here..."
            textAlignVertical="top" // Aligns text to the top
            value={meaning}
            onChangeText={(text) => onChangeMeaning(text)}
          />
        </View>
        <View>
          <Text style={styles.signupLabel}>Singer Name: </Text>
          <TextInput
            value={sungByName}
            style={styles.textInput}
            onChangeText={(text) => onChangeSungByName(text)}
          />
        </View>
        <View>
          <Text style={styles.signupLabel}>Singer Email: </Text>
          <TextInput
            value={sungByEmail}
            style={styles.textInput}
            onChangeText={(text) => onChangeSungByEmail(text)}
          />
        </View>
        <View>
          <Text style={styles.signupLabel}>Scale: </Text>
          <TextInput
            value={scale}
            style={styles.textInput}
            onChangeText={(text) => onChangeScale(text)}
          />
        </View>
        <Button
          onPress={() => handleSignUp(song, true)}
          mode="contained"
          style={styles.signupUpdate}
        >
          Update
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    paddingLeft: 10,
    paddingRight: 10,
  },
  sungby: {
    fontSize: 14,
    paddingLeft: 10,
    paddingBottom: 5,
    fontStyle: "italic",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 40,
  },
  list: {
    marginTop: 20,
  },
  favcontainer: {
    flexDirection: "row", // Arranges items horizontally
    padding: 0,
  },
  favcolumna: {
    padding: 0,
    margin: 0,
  },
  favcolumnb: {
    padding: 0,
    alignItems: "center",
  },
  textArea: {
    borderColor: "lightgray",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "white",
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
  signupUpdate: {
    marginTop: 20,
    marginBottom: 300,
  },
  saveButton: {
    marginTop: 20,
  },
});
