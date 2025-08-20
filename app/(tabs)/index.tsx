import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import DosePopup from "../../components/DosePopup";

type DoseLog = { at: number };
type Med = {
    id: string;
    name: string;
    timesPerDay: number;
    totalDoses: number;
    doseLogs: DoseLog[];
    createdAt: number;
};

const STORAGE_KEY = "meds.v1";

function since(ms: number) {
    const s = Math.floor((Date.now() - ms) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${sec}s`;
    return `${sec}s`;
}

export default function Home() {
    const [meds, setMeds] = useState<Med[]>([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [editingMed, setEditingMed] = useState<Med | null>(null);
    const [, forceTick] = useState(0);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        tickRef.current = setInterval(() => forceTick((n) => n + 1), 1000);

        return () => {
            if (tickRef.current !== null) {
                clearInterval(tickRef.current);
                tickRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((data) => {
            if (data) {
                setMeds(JSON.parse(data));
            }
        });
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
    }, [meds]);

    function openAddPopup() {
        setEditingMed(null);
        setPopupVisible(true);
    }

    function openEditPopup(med: Med) {
        setEditingMed(med);
        setPopupVisible(true);
    }

    function closePopup() {
        setPopupVisible(false);
        setEditingMed(null);
    }

    function saveMed(medData: Omit<Med, 'id' | 'doseLogs' | 'createdAt'>) {
        if (editingMed) {
            setMeds((arr) =>
                arr.map((m) =>
                    m.id === editingMed.id
                        ? {
                              ...m,
                              name: medData.name,
                              timesPerDay: medData.timesPerDay,
                              totalDoses: medData.totalDoses,
                          }
                        : m
                )
            );
        } else {
            const newMed: Med = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: medData.name,
                timesPerDay: medData.timesPerDay,
                totalDoses: medData.totalDoses,
                doseLogs: [],
                createdAt: Date.now(),
            };
            setMeds((arr) => [newMed, ...arr]);
        }
    }

    function delMed(id: string) {
        Alert.alert("Delete dose?", "This will remove all its logs.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => setMeds((arr) => arr.filter((m) => m.id !== id)),
            },
        ]);
    }

    function incrementDose(m: Med) {
        setMeds((arr) =>
            arr.map((x) =>
                x.id === m.id
                    ? {
                          ...x,
                          doseLogs: [{ at: Date.now() }, ...x.doseLogs],
                      }
                    : x
            )
        );
    }

    function decrementDose(m: Med) {
        if (m.doseLogs.length === 0) return;
        
        setMeds((arr) =>
            arr.map((x) =>
                x.id === m.id
                    ? {
                          ...x,
                          doseLogs: x.doseLogs.slice(1),
                      }
                    : x
            )
        );
    }

    const remaining = (m: Med) => m.totalDoses === -1 ? -1 : Math.max(0, m.totalDoses - m.doseLogs.length);
    const dailySoFar = (m: Med) => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return m.doseLogs.filter((d) => d.at >= start.getTime()).length;
    };
    const isComplete = (m: Med) => m.totalDoses === -1 ? false : m.doseLogs.length >= m.totalDoses;

    const renderItem = ({ item: m }: { item: Med }) => {
        const last = m.doseLogs[0]?.at ?? null;
        const complete = isComplete(m);
        
        return (
            <View
                style={{
                    backgroundColor: complete ? "#ecfdf5" : "#fef7ff",
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: complete ? "#a7f3d0" : "#e9d5ff",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                    }}
                >
                    <Text
                        style={{
                            color: "#7c3aed",
                            fontSize: 18,
                            fontWeight: "700",
                        }}
                    >
                        {m.name}
                    </Text>
                    <Text style={{ color: complete ? "#059669" : "#8b5cf6" }}>
                        {dailySoFar(m)}/{m.timesPerDay} today • {m.totalDoses === -1 ? "∞ doses" : m.doseLogs.length >= m.totalDoses ? `${m.doseLogs.length - m.totalDoses} extra taken` : `${remaining(m)} left`}
                    </Text>
                </View>

                <Text style={{ color: complete ? "#059669" : "#8b5cf6", marginTop: 6 }}>
                    Last taken:{" "}
                    {last
                        ? `${new Date(last).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })} (${since(last)} ago)`
                        : "—"}
                </Text>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <Pressable
                        onPress={() => incrementDose(m)}
                        style={{
                            backgroundColor: "#a78bfa",
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 999,
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "700" }}>
                            + Dose
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => decrementDose(m)}
                        disabled={m.doseLogs.length === 0}
                        style={{
                            backgroundColor: m.doseLogs.length === 0 ? "#e9d5ff" : "#fca5a5",
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 999,
                            opacity: m.doseLogs.length === 0 ? 0.5 : 1,
                        }}
                    >
                        <Text style={{ color: m.doseLogs.length === 0 ? "#c4b5fd" : "white", fontWeight: "700" }}>
                            - Dose
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => openEditPopup(m)}
                        style={{
                            backgroundColor: "#c4b5fd",
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 999,
                        }}
                    >
                        <Text style={{ color: "white" }}>Edit</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => delMed(m.id)}
                        style={{
                            backgroundColor: "#fca5a5",
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: 999,
                        }}
                    >
                        <Text style={{ color: "white" }}>Delete</Text>
                    </Pressable>
                </View>

                {m.doseLogs.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ color: complete ? "#059669" : "#8b5cf6", marginBottom: 4 }}>
                            Recent doses:
                        </Text>
                        {m.doseLogs.slice(0, 5).map((d, i) => (
                            <Text key={i} style={{ color: complete ? "#10b981" : "#a78bfa" }}>
                                • {new Date(d.at).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}
                            </Text>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const sorted = useMemo(
        () => meds.slice().sort((a, b) => a.name.localeCompare(b.name)),
        [meds]
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f7ff" }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 10, flex: 1 }}>
                <Text
                    style={{
                        color: "#8b5cf6",
                        fontSize: 24,
                        fontWeight: "800",
                        marginBottom: 12,
                    }}
                >
                    Dozer
                </Text>

                <FlatList
                    data={sorted}
                    keyExtractor={(m) => m.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            paddingTop: 100
                        }}>
                            <Text style={{ 
                                color: "#a78bfa", 
                                fontSize: 18,
                                textAlign: 'center'
                            }}>
                                Currently not taking any doses
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ 
                        paddingBottom: 100,
                        flexGrow: 1
                    }}
                />

                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    left: 20,
                }}>
                    <Pressable
                        onPress={openAddPopup}
                        style={{
                            backgroundColor: "#a78bfa",
                            paddingVertical: 16,
                            borderRadius: 999,
                            alignItems: 'center',
                            shadowColor: "#8b5cf6",
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.3,
                            shadowRadius: 4.65,
                            elevation: 8,
                        }}
                    >
                        <Text style={{ 
                            color: "black", 
                            fontWeight: "800",
                            fontSize: 18
                        }}>
                            + Add Dose
                        </Text>
                    </Pressable>
                </View>
            </View>

            <DosePopup
                visible={popupVisible}
                onClose={closePopup}
                onSave={saveMed}
                editingMed={editingMed}
            />
        </SafeAreaView>
    );
}
