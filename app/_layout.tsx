import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
// import 'react-native-reanimated'

export const unstable_settings = {
    anchor: '(tabs)',
}

export default function RootLayout() {

    return (
        <ClerkProvider tokenCache={tokenCache}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(main)" options={{ title:"Mes repas"  }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
        </ClerkProvider>

    )
}

