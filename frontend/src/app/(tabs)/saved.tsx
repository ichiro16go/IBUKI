import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Chip, Heading, HobbyCard, IbukiScreen, IconButton, Kicker } from "@/components/ibuki-ui";
import { IbukiSpacing } from "@/constants/ibuki-theme";
import { hobbies, savedFilters } from "@/data/ibuki";

export default function SavedScreen() {
  const [selectedFilter, setSelectedFilter] = useState(savedFilters[0]);

  return (
    <IbukiScreen withTabBar>
      <View style={styles.header}>
        <View>
          <Kicker>SAVED · 14 hobbies</Kicker>
          <Heading size="medium">気になった{"\n"}趣味たち</Heading>
        </View>
        <IconButton
          label="Tune filters"
          icon={{ ios: "slider.horizontal.3", android: "tune", web: "slider.horizontal.3" }}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {savedFilters.map((filter, index) => (
          <Chip
            key={filter}
            label={filter}
            count={index === 0 ? 14 : index === 1 ? 5 : index === 2 ? 7 : index === 3 ? 4 : 9}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          />
        ))}
      </ScrollView>

      <View style={styles.grid}>
        {hobbies.map((hobby, index) => (
          <View key={hobby.id} style={[styles.gridItem, index % 3 === 1 && styles.tallItem]}>
            <HobbyCard
              hobby={hobby}
              compact
              onPress={() => router.push({ pathname: "/hobby/[id]", params: { id: hobby.id } } as never)}
            />
          </View>
        ))}
      </View>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterRow: {
    gap: IbukiSpacing.xs,
    paddingRight: IbukiSpacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.sm,
  },
  gridItem: {
    width: "48.2%",
  },
  tallItem: {
    marginTop: IbukiSpacing.xl,
  },
});
