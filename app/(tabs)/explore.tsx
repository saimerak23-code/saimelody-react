import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ApiUrl, Pd } from "@/constants/common";
import { iProfile } from "@/dbmodels/iprofile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Card, Icon, MD3Colors, RadioButton } from "react-native-paper";
//import { REACT_APP_DEV_MODE} from "@env";

interface ICenter {
  centerId: string;
  centerName: string;
}
interface iCenterProfile {
  centers: ICenter[];
  profile: iProfile;
}

export default function TabTwoScreen() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [centerId, setCenterId] = useState<string>("first");
  const [centerName, setCenterName] = useState<string>("first");
  const [officer, setOfficer] = useState<Boolean>(false);
  const [pd, setPd] = useState("");
  const [showPd, setShowPd] = useState(false);
  const defProfile: iProfile = {
    username: "",
    email: "",
    centerId: "",
    centerName: "",
    profileSet: false,
    officer: false,
  };
  const [profile, setProfile] = useState<iProfile>(defProfile);
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [centerProfile, setCenterProfile] = useState<iCenterProfile>();
  const aUrl = ApiUrl;

  const handleSubmit = async () => {
    if (username.trim() === "" || email.trim() === "") {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    const prof: iProfile = {
      username: username,
      email: email,
      centerId: centerId,
      centerName: centerName,
      profileSet: true,
      officer: officer,
    };
    setProfile(prof);
    await AsyncStorage.setItem("saiprofile", JSON.stringify(prof));
    Alert.alert("Success", "Form submitted!");
    setLoading(false);
    setEdit(false);
  };

  const handleValueChange = (newValue: string) => {
    setCenterId(newValue);
    // You can now find the label associated with newValue
    const selectedOption = centerProfile?.centers.find(
      (option) => option.centerId === newValue
    );
    if (selectedOption) {
      setCenterName(selectedOption.centerName);
    }
  };

  const handleEdit = async () => {
    setEdit(true);
    setLoading(false);
    setProfile({ ...profile, profileSet: false });
  };

  const checkOfficer = async () => {
    if (pd == Pd) {
      setOfficer(true);
      const prof: iProfile = {
        username: username,
        email: email,
        centerId: centerId,
        centerName: centerName,
        profileSet: true,
        officer: true,
      };
      setProfile({ ...profile, officer: true });
      await AsyncStorage.setItem("saiprofile", JSON.stringify(prof));
      setShowPd(false);
      setPd("");
      Alert.alert("Success", "Password Accepted!");
    } else {
      Alert.alert("Error", "Password does not match!");
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("saiprofile");
      if (jsonValue != null) {
        const prof: iProfile = JSON.parse(jsonValue ?? "");
        console.log(prof);
        setProfile(prof);
        setUsername(prof.username);
        setEmail(prof.email);
        setCenterId(prof.centerId);
        setCenterName(prof.centerName);
        setOfficer(prof.officer);
        setShowPd(false);

        const url = aUrl + "/center/getcenters";
        const response = await fetch(url, {
          method: "GET", // or POST, PUT, etc.
          //headers: new Headers({
          //  "ngrok-skip-browser-warning": "true", // The value can be anything
          //}),
        });
        const json: ICenter[] = await response.json();
        const result: iCenterProfile = {
          centers: json,
          profile: profile,
        };
        setCenterProfile(result);
        return result;
      } else {
        const result: iCenterProfile = {
          centers: [],
          profile: defProfile,
        };
        setCenterProfile(result);
        return result;
      }
    } catch (e) {
      console.log(e);
      const result: iCenterProfile = {
        centers: [],
        profile: defProfile,
      };
      setCenterProfile(result);
      return result;
    }
  };

  function getDataSync() {
    setLoading(false);
    getData()
      .then((res) => {
        console.log(res);
        setCenterProfile(res);
        setLoading(true);
      })
      .catch((err) => {
        console.log(err);
        setLoading(true);
      });
  }

  useEffect(() => {
    if (!loading) {
      getData()
        .then((res) => {
          console.log(res);
          setCenterProfile(res);
          setLoading(true);
        })
        .catch((err) => {
          console.log(err);
          setLoading(true);
        });
    }
  }, [centerProfile]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Profile</ThemedText>
        <Button compact={true} mode="text" onPress={() => getDataSync()}>
          <Icon source="refresh" size={20} color={MD3Colors.neutral60} />
        </Button>
      </ThemedView>
      {!profile.profileSet && (
        <View>
          <View style={styles.fullviewlabelvalue}>
            <ThemedText style={styles.fullviewtextlabel}>Name: </ThemedText>
            <TextInput
              style={styles.fullviewtextinput}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.fullviewlabelvalue}>
            <ThemedText style={styles.fullviewtextlabel}>Email: </ThemedText>
            <TextInput
              style={styles.fullviewtextinput}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.fullviewlabelvalue}>
            <ThemedText style={styles.fullviewlabel}>
              Center: {centerName}
            </ThemedText>
          </View>
          <ScrollView style={styles.scrollView}>
            <ThemedText style={styles.selectCenterTitle}>
              Select Sai Center:{" "}
            </ThemedText>
            <Button compact={true} mode="text" onPress={() => getDataSync()}>
              <ThemedText> Don't see my Center?</ThemedText>
              <Icon source="refresh" size={20} color={MD3Colors.neutral60} />
            </Button>
            <RadioButton.Group
              onValueChange={handleValueChange}
              value={centerId}
            >
              {!profile.profileSet &&
                centerProfile?.centers.map((item) => (
                  <RadioButton.Item
                    key={item.centerId}
                    label={item.centerName}
                    value={item.centerId}
                    style={styles.fullviewradio}
                  />
                ))}
            </RadioButton.Group>
          </ScrollView>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.profileName}
          >
            Update Profile
          </Button>
        </View>
      )}
      {profile.profileSet && (
        <Card style={styles.profileContainer}>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewvalue}>{profile.username}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Icon source="email-outline" size={20} />
            <Text style={styles.fullviewvalue}> {profile.email}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Icon source="map-marker" size={20} />
            <Text style={styles.fullviewvalue}>{profile.centerName}</Text>
          </View>
          <Button compact={true} mode="text" onPress={handleEdit}>
            <Icon source="account-edit" size={30} />
          </Button>
          {!profile.officer && (
            <Button
              compact={true}
              mode="contained"
              onPress={() => setShowPd(true)}
            >
              Are you an Officer?
            </Button>
          )}
          {showPd && (
            <Card style={styles.pdcontainer}>
              <ThemedText>Enter Password</ThemedText>
              <TextInput
                style={styles.fullviewtextinput}
                placeholder="Password"
                value={pd}
                onChangeText={setPd}
              />
              <View style={styles.favcontainer}>
                <Button compact={true} mode="text" onPress={checkOfficer}>
                  Save
                </Button>
                <Button
                  compact={true}
                  mode="text"
                  onPress={() => setShowPd(false)}
                >
                  No I'm not Officer
                </Button>
              </View>
            </Card>
          )}
        </Card>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  scrollView: {
    padding: 5,
    height: 200,
    borderColor: "lightgrey",
    borderStyle: "solid",
    borderWidth: 1,
  },
  profileContainer: {
    padding: 10,
  },
  fullviewEditRow: {
    paddingTop: 0,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  fullviewlabelvalue: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  fullviewtextlabel: {
    width: "20%",
  },
  fullviewtextinput: {
    paddingTop: 0,
    paddingBottom: 0,
    borderColor: "grey",
    borderWidth: 1,
    width: "80%",
    borderRadius: 5,
    backgroundColor: "whitesmoke",
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
  fullviewlabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 0,
  },
  fullviewvalue: {
    fontSize: 16,
    width: "100%",
  },
  centerNames: {
    padding: 0,
    margin: 0,
  },
  selectCenterTitle: {
    fontWeight: "bold",
  },
  profileName: {
    marginTop: 10,
  },
  pdcontainer: {
    marginBottom: 300,
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
});
