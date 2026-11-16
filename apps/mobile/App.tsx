import { useState } from "react";
import { SafeAreaView, Text, Pressable, ScrollView, View, Image } from "react-native";
import data from "../../content/a0_greetings.json";
const L = [["roman_urdu", "Roman Urdu"], ["urdu", "اردو"], ["hindi", "हिन्दी"]] as const;
export default function App() {
  const [lang, setLang] = useState<(typeof L)[number][0]>("roman_urdu");
  return (<SafeAreaView style={{ flex: 1, backgroundColor: "#FBF8F2", paddingTop: 40 }}><ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
    <Image source={require("./assets/icon.png")} style={{ width: 72, height: 72, borderRadius: 16 }} />
    <Text style={{ fontSize: 26, fontWeight: "800", color: "#1B2A6B" }}>TALORA</Text>
    <Text>Starter app: vocabulary only. Login, games and sync are not built on mobile yet.</Text>
    <View style={{ flexDirection: "row", gap: 8 }}>{L.map(([k, n]) => <Pressable key={k} onPress={() => setLang(k)} style={{ padding: 12, borderRadius: 12, backgroundColor: lang === k ? "#2F7DE8" : "#E4E8F2" }}><Text style={{ color: lang === k ? "#fff" : "#1F2430" }}>{n}</Text></Pressable>)}</View>
    {data.words.map(w => <View key={w.en} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 16 }}><Text style={{ fontSize: 20, fontWeight: "700" }}>{w.en}</Text><Text style={{ fontSize: 18 }}>{(w as any)[lang]}</Text></View>)}
  </ScrollView></SafeAreaView>);
}
