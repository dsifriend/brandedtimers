import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function NotFoundScreen() {
  const textColor = useColorScheme() === 'dark' ? '#fff' : '#000';
  const linkColor = useColorScheme() === 'dark' ? '#1e90ff' : '#007bff';

  return (
    <>
      <Stack.Screen options={{ title: 'Wibbly Wobbly, Timey-Wimey Stuff' }} />
      <View style={styles.container}>
        <Text style={[styles.flavorText, { color: textColor }]}>
          People assume that time is a strict progression of cause to effect,
          but actually from a non-linear, non-subjective viewpoint,
          it's more like a big ball of wibbly wobbly, timey-wimey stuff
        </Text>
        <Link href="/" style={[styles.link, { color: linkColor }]}>
          There might be a way out. A delivery hatch or something.
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  flavorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
