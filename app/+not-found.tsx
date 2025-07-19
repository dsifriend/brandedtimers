import { useCustomization } from '@/components/customization/context/CustomizationContext';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const { state } = useCustomization();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: state.colors.background,
      padding: 20,
    },
    flavorText: {
      fontSize: 16,
      textAlign: 'center',
      color: state.colors.text,
      marginBottom: 20,
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Wibbly Wobbly, Timey-Wimey Stuff' }} />
      <View style={styles.container}>
        <Text style={[styles.flavorText, { color: state.colors.text }]}>
          People assume that time is a strict progression of cause to effect,
          but actually from a non-linear, non-subjective viewpoint,
          it's more like a big ball of wibbly wobbly, timey-wimey stuff
        </Text>
        <Link href="/" style={[styles.link, { color: state.colors.accent }]}>
          There might be a way out. A delivery hatch or something.
        </Link>
      </View>
    </>
  );
}
