import songJson from "@/assets/saisongs.json";
import { SaiSongHist } from "@/dbmodels/isong";
import React, { PropsWithChildren, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Collapsible } from "./Collapsible";
type Props = PropsWithChildren<{
  songId: string;
}>;

export default function SongViewer({ songId }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const song: SaiSongHist = songJson.filter(
    (result) => result.SongId == songId
  )[0];

  return (
    <View>
      <View style={{ padding: 15, margin: 10 }}>
        <Text style={styles.fullviewlyrics}>{song?.Lyrics}</Text>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.fullviewmeaning}>{song?.Meaning}</Text>
        </View>
        <Collapsible title="Bhajan Insights">
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>Gents Pitch: </Text>
            <Text style={styles.fullviewvalue}>{song?.GentsPitch}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>Ladies Pitch: </Text>
            <Text style={styles.fullviewvalue}>{song?.LadiesPitch}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>Raga: </Text>
            <Text style={styles.fullviewvalue}>{song?.Raga}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>Deity: </Text>
            <Text style={styles.fullviewvalue}>{song?.Deity}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>Language: </Text>
            <Text style={styles.fullviewvalue}>{song?.LanguageSong}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>Beat: </Text>
            <Text style={styles.fullviewvalue}>{song?.Beat}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>SuggestedTempo: </Text>
            <Text style={styles.fullviewvalue}>{song?.SuggestedTempo}</Text>
          </View>
          <View style={styles.fullviewlabelvalue}>
            <Text style={styles.fullviewlabel}>ComplexityLevel: </Text>
            <Text style={styles.fullviewvalue}>{song?.ComplexityLevel}</Text>
          </View>
        </Collapsible>
      </View>
    </View>
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
  fullviewlyrics: {
    fontSize: 18,
    padding: 8,
    paddingBottom: 0,
    margin: 0,
    backgroundColor: "whitesmoke",
    borderRadius: 10,
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
    marginTop: 10,
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
  scrollView: {
    padding: 5,
    height: 200,
    borderColor: "lightgrey",
    borderStyle: "solid",
    borderWidth: 1,
  },
});
