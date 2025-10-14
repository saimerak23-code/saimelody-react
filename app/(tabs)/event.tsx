import ParallaxScrollView from "@/components/ParallaxScrollView";
import ReOrder from "@/components/ReOrder";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ApiUrl } from "@/constants/common";
import { IEvent } from "@/dbmodels/ievent";
import { iEventProfile } from "@/dbmodels/ieventprofile";
import { iProfile } from "@/dbmodels/iprofile";
import { ISongSignUp } from "@/dbmodels/isongsign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Card, Chip, Icon, MD3Colors } from "react-native-paper";

export default function FavScreen() {
  const [events, setEvents] = useState<IEvent[]>();
  const [eventNow, setEventNow] = useState<IEvent>({
    eventId: "",
    eventName: "",
    eventDate: new Date(),
    centerId: "",
    maxSongs: 0,
  });
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [addEvent, setAddEvent] = useState(false);
  const [editEvent, setEditEvent] = useState(false);
  const [aeUrl, setAeUrl] = useState("");
  const [center, setCenter] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [eventProfile, setEventProfile] = useState<iEventProfile>();
  const [songs, setSongs] = useState<ISongSignUp[]>([
    {
      songId: 0,
      eventId: "",
      centerId: "",
      songTitle: "",
      songLyrics: "",
      songMeaning: "",
      sungByName: "",
      sungByEmail: "",
      scale: "",
      songOrder: 0,
    },
  ]);
  const [showSong, setShowSong] = useState(false);
  const noProfile = {
    username: "",
    email: "",
    centerId: "",
    centerName: "",
    profileSet: false,
    officer: false,
  };

  const [profile, setProfile] = useState<iProfile>(noProfile);
  const aUrl = ApiUrl;

  const getData = async () => {
    const jsonValue = await AsyncStorage.getItem("saiprofile");
    const prof: iProfile =
      jsonValue != null ? JSON.parse(jsonValue) : noProfile;
    setProfile(prof);
    if (prof == null || !prof.profileSet) {
      const arr: IEvent[] = [];
      const result: iEventProfile = {
        events: arr,
        profile: noProfile,
      };
      setEventProfile(result);
      return result;
    }
    try {
      const url = aUrl + "/event/getevents?centerId=" + prof.centerId;
      console.log(url);
      const response = await fetch(url, {
        method: "GET", // or POST, PUT, etc.
        headers: new Headers({
          //"ngrok-skip-browser-warning": "true", // The value can be anything
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
        profile: prof,
      };
      return result;
    }
  };

  const getDataAndSetProfile = async () => {
    getData()
      .then((res) => {
        console.log(res);
        setEvents(res.events);
        setProfile(res.profile);
        setEventProfile(res);
        setLoading(true);
      })
      .catch((err) => {
        setLoading(true);
      });
  };

  const handleAddEvent = async () => {
    setEventId("newevent");
    setEventName("");
    setEventDate(new Date());
    setAeUrl("/event/addevent");
    setAddEvent(true);
    setEditEvent(true);
  };

  const handleEditEvent = async (evt: IEvent) => {
    setEventNow(evt);
    setEventId(evt.eventId);
    setEventName(evt.eventName);
    setEventDate(evt.eventDate);
    setAeUrl("/event/editevent");
    setAddEvent(true);
    setEditEvent(true);
  };

  const handleSubmit = async () => {
    if (eventName.trim() === "") {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      const evt = {
        EventId: eventId,
        EventName: eventName,
        EventDate: eventDate,
        CenterId: eventProfile?.profile.centerId,
      };
      console.log(evt);
      const url = aUrl + aeUrl;
      const response = await fetch(url, {
        method: "POST", // or POST, PUT, etc.
        headers: new Headers({
          "ngrok-skip-browser-warning": "true", // The value can be anything
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(evt),
      });
      const result = await response.json();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setAddEvent(false);
  };

  const handleExport = async (evt: IEvent) => {
    try {
      const url =
        aUrl +
        `/song/Export?centerId=${profile.centerId}&eventId=${evt.eventId}`;
      console.log(url);
      Linking.openURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate: Date) => {
    setShow(false);
    const currentDate = selectedDate;
    setEventDate(currentDate);
  };

  const showMode = (currentMode: string) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    setMode("date");
    setShow(true);
  };

  const showTimepicker = () => {
    setMode("time");
    setShow(true);
  };

  const handleDelete = async (evt: IEvent) => {
    Alert.alert(
      "Delete Event", // Title of the alert
      "Are you sure you want to remove this Event?", // Message of the alert
      [
        {
          text: "Cancel", // Text for the first button
          onPress: () => console.log("ok"), // Callback when Cancel is pressed
          style: "cancel", // Style for the button (e.g., 'cancel', 'destructive', 'default')
        },
        {
          text: "Confirm", // Text for the second button
          onPress: () => handleEditDelete(evt, false), // Callback when Confirm is pressed
        },
      ],
      { cancelable: false } // Optional: prevents dismissing by tapping outside the alert (Android only)
    );
  };

  const handleEditDelete = async (evt: IEvent, isEdit: boolean) => {
    console.log(evt);
    if (evt.eventName.trim() === "") {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      const eurl = isEdit ? "/event/editevent" : "/event/deleteevent";
      const url = aUrl + eurl;
      const response = await fetch(url, {
        method: "POST", // or POST, PUT, etc.
        headers: new Headers({
          "ngrok-skip-browser-warning": "true", // The value can be anything
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(evt),
      });
      const result = await response.json();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setAddEvent(false);
  };

  const viewSongs = async (ev: IEvent) => {
    setEventNow(ev);
    try {
      const url =
        aUrl +
        "/song/getsongs?eventId=" +
        ev.eventId +
        "&centerId=" +
        ev.centerId;
      const response = await fetch(url, {
        method: "GET", // or POST, PUT, etc.
        headers: new Headers({
          "ngrok-skip-browser-warning": "true", // The value can be anything
        }),
      });
      const result = await response.json();
      setSongs(result);
      setShowSong(true);
    } catch (e) {}
  };

  useEffect(() => {
    if (!loading) {
      getData()
        .then((res) => {
          console.log(res);
          setEvents(res.events);
          setProfile(res.profile);
          setEventProfile(res);
          setLoading(true);
        })
        .catch((err) => {
          setLoading(true);
        });
    }
  }, [eventProfile, showSong]);

  function formatDate(inputDate: Date) {
    const dateObj = new Date(inputDate);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formattedDateArray = new Intl.DateTimeFormat(
      "en-CA",
      options
    ).formatToParts(dateObj);
    const year = formattedDateArray.find(
      (entry) => entry.type === "year"
    )?.value;
    const month = formattedDateArray
      .find((entry) => entry.type === "month")
      ?.value.padStart(2, "0");
    const day = formattedDateArray
      .find((entry) => entry.type === "day")
      ?.value.padStart(2, "0");
    const hour = formattedDateArray
      .find((entry) => entry.type === "hour")
      ?.value.padStart(2, "0");
    const minute = formattedDateArray
      .find((entry) => entry.type === "minute")
      ?.value.padStart(2, "0");
    return `${year}-${month}-${day} ${hour}-${minute}`;
  }

  const addEventForm = () => {
    return (
      <Card style={styles.formEventContainer}>
        <View>
          <Text style={styles.formEventHeading}>Submit Event: </Text>
        </View>
        <View style={styles.formEvent}>
          <Text style={styles.onecol}>Event Name: </Text>
          <TextInput
            style={styles.twocol}
            placeholder="Enter Event Name"
            value={eventName}
            onChangeText={setEventName}
          />
        </View>
        <View>
          <View style={styles.eventDateLabel}>
            <Text>Event Date: {formatDate(eventDate)}</Text>
          </View>
          <View style={styles.formEvent}>
            <Button
              style={styles.onecolb}
              mode="text"
              onPress={() => showDatepicker()}
            >
              Select Date
            </Button>
            <Button
              style={styles.onecolb}
              mode="text"
              onPress={() => showTimepicker()}
            >
              Select Time
            </Button>
          </View>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={new Date(eventDate)}
              mode={mode}
              is24Hour={true}
              onChange={onChange}
            />
          )}
        </View>
        <View style={styles.srchbuttons}>
          <Button mode="text" onPress={handleSubmit}>
            Save
          </Button>
          <Button mode="text" onPress={() => setAddEvent(false)}>
            Close
          </Button>
        </View>
      </Card>
    );
  };

  return (
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
        <ThemedText type="title">Events</ThemedText>
        {profile.officer && (
          <Button compact={true} mode="text" onPress={handleAddEvent}>
            <Icon
              source="calendar-plus"
              size={20}
              color={MD3Colors.neutral60}
            />
          </Button>
        )}
        <Button
          compact={true}
          mode="text"
          onPress={() => getDataAndSetProfile()}
        >
          <Icon source="refresh" size={20} color={MD3Colors.neutral60} />
        </Button>
      </ThemedView>
      <View>
        <View>
          {loading && (profile === undefined || !profile.profileSet) && (
            <Chip icon="information">User Profile Not Set</Chip>
          )}
        </View>
        {addEvent && addEventForm()}
      </View>
      <View>
        {!loading ? (
          <View>
            <Text> Checking Events</Text>
          </View>
        ) : events == null || events?.length == 0 ? (
          <View>
            <Text> No Events found</Text>{" "}
          </View>
        ) : (
          !showSong &&
          events?.map((item) => (
            <Card key={item.eventId} style={styles.eventCard}>
              <View>
                <View>
                  <Text style={styles.eventNameValue}>{item.eventName}</Text>
                </View>
                <View>
                  <Text style={styles.eventDateValue}>
                    {formatDate(item.eventDate)}
                  </Text>
                </View>
              </View>
              {profile.officer && (
                <View style={styles.titleContainer}>
                  <Button
                    compact={true}
                    mode="text"
                    style={styles.buttonEventFirst}
                    onPress={() => viewSongs(item)}
                  >
                    <Icon source="playlist-music-outline" size={23} />
                  </Button>
                  <Button
                    compact={true}
                    mode="text"
                    style={styles.buttonEvents}
                    onPress={() => handleEditEvent(item)}
                  >
                    <Icon source="square-edit-outline" size={23} />
                  </Button>
                  <Button
                    compact={true}
                    mode="text"
                    style={styles.buttonEvents}
                    onPress={() => handleExport(item)}
                  >
                    <Icon source="file-pdf-box" size={28} />
                  </Button>
                  <Button
                    compact={true}
                    mode="text"
                    onPress={() => handleDelete(item)}
                    style={styles.buttonEvents}
                  >
                    <Icon source="trash-can-outline" size={23} />
                  </Button>
                </View>
              )}
            </Card>
          ))
        )}
        <View>
          {showSong && (
            <View>
              <View style={styles.srchbuttons}>
                <Text style={styles.songListLabel}>{eventNow?.eventName}</Text>
                <Button
                  compact={true}
                  mode="text"
                  onPress={() => setShowSong(false)}
                >
                  <Icon source="close" size={20} />
                </Button>
              </View>
              {songs === null || songs.length == 0 ? (
                <View>
                  <Text>No songs signed up</Text>
                </View>
              ) : (
                <ReOrder
                  songs={songs}
                  event={eventNow}
                  centerId={profile.centerId}
                  refreshSong={viewSongs}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </ParallaxScrollView>
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
    gap: 8,
  },
  scrollView: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  songListLabel: {
    fontSize: 20,
    fontWeight: "bold",
  },
  srchbuttons: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    justifyContent: "center",
  },
  eventCard: {
    marginBottom: 10,
  },
  songCard: {
    marginBottom: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  favcontainer: {
    flexDirection: "row", // Arranges items horizontally
    padding: 0,
  },
  favcolumna: {
    paddingVertical: 0,
    marginTop: 10,
  },
  favcolumnb: {
    paddingVertical: 0,
    alignItems: "center",
  },
  buttonEvents: {
    padding: 0,
    margin: 0,
  },
  buttonEventFirst: {
    padding: 0,
    margin: 0,
    marginLeft: 25,
  },
  fullviewlabelvalue: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  fullviewlabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 15,
  },
  fullviewvalue: {
    fontSize: 16,
    width: "100%",
  },
  rowItem: {
    height: 100,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  formEventHeading: {
    fontSize: 20,
    paddingBottom: 10,
  },
  formEventContainer: {
    padding: 10,
  },
  formEvent: {
    flex: 3, // the number of columns you want to devide the screen into
    marginHorizontal: "auto",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "lightgray",
    marginBottom: 10,
  },
  onecol: {
    paddingTop: 10,
    paddingLeft: 5,
    flex: 1,
  },
  onecolb: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  twocol: {
    flex: 2,
  },
  eventDateLabel: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "lightgray",
    marginBottom: 10,
  },
  eventNameValue: {
    fontWeight: "bold",
    fontSize: 16,
    paddingTop: 10,
    paddingLeft: 10,
  },
  eventDateValue: {
    paddingLeft: 10,
  },
});
