import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Chip,
  EncounterCard,
  Heading,
  IbukiScreen,
  IconButton,
  NotificationModal,
} from "@/components/ibuki-ui";
import { IbukiColors, IbukiFonts, IbukiSpacing } from "@/constants/ibuki-theme";
import {
  encounterFilters,
  encounters,
  getEncounterHobby,
  hobbies,
} from "@/data/ibuki";
import { useEncounterPreferences } from "@/state/encounter-preferences";

export default function EncountersScreen() {
  const [selectedFilter, setSelectedFilter] = useState(encounterFilters[0]);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const { isEncounterHidden } = useEncounterPreferences();
  const featuredHobby = hobbies[0];
  const visibleEncounters = encounters.filter((encounter) => {
    const hobby = getEncounterHobby(encounter);
    return !isEncounterHidden(hobby.id);
  });

  function openHobby(id: string) {
    router.push({
      pathname: "/hobby/[id]",
      params: { id, from: "encounters" },
    } as never);
  }

  return (
    <IbukiScreen withTabBar>
      <View style={styles.header}>
        <View>
          <Heading size="medium">今日すれ違った{"\n"}趣味たち</Heading>
        </View>
        <IconButton
          label="Show arrival notification"
          icon={{
            ios: "bell.badge",
            android: "notifications",
            web: "bell.badge",
          }}
          onPress={() => setNotificationVisible(true)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {encounterFilters.map((filter, index) => (
          <Chip
            key={filter}
            label={filter}
            count={
              index === 0 ? 7 : index === 1 ? 1 : index === 3 ? 4 : undefined
            }
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          />
        ))}
      </ScrollView>

      <View style={styles.feed}>
        {visibleEncounters.map((encounter) => {
          const hobby = getEncounterHobby(encounter);
          return (
            <EncounterCard
              key={encounter.id}
              hobby={hobby}
              time={encounter.time}
              context={encounter.context}
              isNew={encounter.isNew}
              onPress={() => openHobby(hobby.id)}
            />
          );
        })}
      </View>

      <Text style={styles.disclaimer}>人ではなく、sukiだけが届きます。</Text>

      <NotificationModal
        visible={notificationVisible}
        hobby={featuredHobby}
        onClose={() => setNotificationVisible(false)}
        onOpen={() => {
          setNotificationVisible(false);
          openHobby(featuredHobby.id);
        }}
      />
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterRow: {
    gap: IbukiSpacing.xs,
    paddingRight: IbukiSpacing.lg,
  },
  feed: {
    gap: IbukiSpacing.md,
  },
  disclaimer: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
