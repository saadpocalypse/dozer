import { useColorScheme, useThemeController } from '@/hooks/useColorScheme';
import React from 'react';
import { Modal, Pressable, Switch, Text, View } from 'react-native';

type Props = {
	visible: boolean;
	onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: Props) {
	const { setColorScheme } = useThemeController();
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
				<View
					style={{
						backgroundColor: isDark ? '#111827' : 'white',
						padding: 16,
						borderTopLeftRadius: 16,
						borderTopRightRadius: 16,
					}}
				>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? 'white' : 'black' }}>Settings</Text>
						<Pressable onPress={onClose}>
							<Text style={{ color: isDark ? '#a78bfa' : '#6366f1', fontWeight: '600' }}>Close</Text>
						</Pressable>
					</View>

					<View style={{ height: 16 }} />

					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<Text style={{ color: isDark ? 'white' : 'black', fontSize: 16 }}>Dark mode</Text>
						<Switch
							value={isDark}
							onValueChange={(val) => setColorScheme(val ? 'dark' : 'light')}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}


