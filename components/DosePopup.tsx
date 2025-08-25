import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

type Med = {
    id: string;
    name: string;
    timesPerDay: number;
    totalDoses: number;
    doseLogs: any[];
    createdAt: number;
    reminderHours?: number;
};

interface DosePopupProps {
    visible: boolean;
    onClose: () => void;
    onSave: (med: Omit<Med, 'id' | 'doseLogs' | 'createdAt'>) => void;
    editingMed?: Med | null;
}

export default function DosePopup({ 
    visible, 
    onClose, 
    onSave, 
    editingMed 
}: DosePopupProps) {
    const [name, setName] = useState("");
    const [timesPerDay, setTimesPerDay] = useState("");
    const [totalDoses, setTotalDoses] = useState("");
    const [isIndefinite, setIsIndefinite] = useState(false);
    const [reminderHours, setReminderHours] = useState("");
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';

    useEffect(() => {
        if (editingMed) {
            setName(editingMed.name);
            setTimesPerDay(String(editingMed.timesPerDay));
            setTotalDoses(String(editingMed.totalDoses));
            setIsIndefinite(editingMed.totalDoses === -1);
            setReminderHours(editingMed.reminderHours ? String(editingMed.reminderHours) : "");
        } else {
            setName("");
            setTimesPerDay("");
            setTotalDoses("");
            setIsIndefinite(false);
            setReminderHours("");
        }
    }, [editingMed, visible]);

    function handleSave() {
        const tpd = Math.max(1, Number(timesPerDay) || 1);
        const td = isIndefinite ? -1 : Math.max(1, Number(totalDoses) || 30);

        if (!name.trim()) {
            Alert.alert("Name required");
            return;
        }

        onSave({
            name: name.trim(),
            timesPerDay: tpd,
            totalDoses: td,
            reminderHours: Number(reminderHours) || 0,
        });
        onClose();
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
            }}>
                <View style={{
                    backgroundColor: isDark ? "#1e1b4b" : "#fef7ff",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "#7c3aed" : "#e9d5ff",
                    width: '100%',
                    maxWidth: 400,
                }}>
                    <Text style={{
                        color: isDark ? "#a78bfa" : "#7c3aed",
                        fontSize: 20,
                        fontWeight: "700",
                        marginBottom: 20,
                        textAlign: 'center',
                    }}>
                        {editingMed ? 'Edit Dose' : 'Add New Dose'}
                    </Text>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Dose name"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        style={{
                            color: isDark ? "#a78bfa" : "#7c3aed",
                            borderColor: isDark ? "#7c3aed" : "#c4b5fd",
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 12,
                            backgroundColor: isDark ? "#312e81" : "white",
                        }}
                    />

                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                        <TextInput
                            value={timesPerDay}
                            onChangeText={setTimesPerDay}
                            placeholder="Doses/day"
                            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                            keyboardType="number-pad"
                            style={{
                                flex: 1,
                                color: isDark ? "#a78bfa" : "#7c3aed",
                                borderColor: isDark ? "#7c3aed" : "#c4b5fd",
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: isDark ? "#312e81" : "white",
                            }}
                        />
                        <TextInput
                            value={totalDoses}
                            onChangeText={setTotalDoses}
                            placeholder="Total doses"
                            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                            keyboardType="number-pad"
                            style={{
                                flex: 1,
                                color: isDark ? "#a78bfa" : "#7c3aed",
                                borderColor: isDark ? "#7c3aed" : "#c4b5fd",
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: isDark ? "#312e81" : "white",
                            }}
                            editable={!isIndefinite}
                        />
                    </View>

                    <Pressable
                        onPress={() => setIsIndefinite(!isIndefinite)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 12,
                            paddingVertical: 8,
                        }}
                    >
                        <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: isDark ? "#7c3aed" : "#c4b5fd",
                            backgroundColor: isIndefinite ? "#a78bfa" : "transparent",
                            marginRight: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {isIndefinite && (
                                <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>✓</Text>
                            )}
                        </View>
                        <Text style={{ color: isDark ? "#a78bfa" : "#7c3aed", fontSize: 16 }}>
                            Indefinite medication (no total dose limit)
                        </Text>
                    </Pressable>

                    <TextInput
                        value={reminderHours}
                        onChangeText={setReminderHours}
                        placeholder="Reminder in hours (optional)"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        keyboardType="number-pad"
                        style={{
                            color: isDark ? "#a78bfa" : "#7c3aed",
                            borderColor: isDark ? "#7c3aed" : "#c4b5fd",
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 12,
                            backgroundColor: isDark ? "#312e81" : "white",
                        }}
                    />

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <Pressable
                            onPress={onClose}
                            style={{
                                flex: 1,
                                backgroundColor: isDark ? "#312e81" : "#e9d5ff",
                                paddingVertical: 12,
                                borderRadius: 12,
                            }}
                        >
                            <Text style={{ 
                                color: isDark ? "#a78bfa" : "#7c3aed", 
                                textAlign: 'center', 
                                fontWeight: '600' 
                            }}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSave}
                            style={{
                                flex: 1,
                                backgroundColor: "#a78bfa",
                                paddingVertical: 12,
                                borderRadius: 12,
                            }}
                        >
                            <Text style={{ color: "white", textAlign: 'center', fontWeight: '800' }}>
                                {editingMed ? 'Save' : 'Add'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
