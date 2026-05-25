import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Chip,
  EncounterCard,
  Heading,
  IbukiScreen,
  IconButton,
  Kicker,
  NotificationModal,
  RadarView,
  SegmentedControl,
  StatsRow,
} from "@/components/ibuki-ui";
import { IbukiColors, IbukiFonts, IbukiSpacing } from "@/constants/ibuki-theme";
import {
  encounterFilters,
  encounters,
  getEncounterHobby,
  hobbies,
} from "@/data/ibuki";

export default function EncountersScreen() {
  const [selectedFilter, setSelectedFilter] = useState(encounterFilters[0]);
  const [mode, setMode] = useState("FEED");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const featuredHobby = hobbies[0];

  function openHobby(id: string) {
    router.push({ pathname: "/hobby/[id]", params: { id } } as never);
  }

  return (
    <IbukiScreen withTabBar>
      <View style={styles.header}>
        <View>
          <View style={styles.liveRow}>
            <View style={styles.livePulse} />
            <Kicker>LIVE · 半径 300m</Kicker>
          </View>
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

      <StatsRow />

      <View style={styles.modeRow}>
        <SegmentedControl
          value={mode}
          options={["FEED", "RADAR"]}
          onChange={setMode}
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

      {mode === "RADAR" ? (
        <RadarView hobbies={hobbies} />
      ) : (
        <View style={styles.feed}>
          {encounters.map((encounter) => {
            const hobby = getEncounterHobby(encounter);
            return (
              <EncounterCard
                key={encounter.id}
                hobby={hobby}
                time={encounter.time}
                distance={encounter.distance}
                context={encounter.context}
                isNew={encounter.isNew}
                onPress={() => openHobby(hobby.id)}
              />
            );
          })}
        </View>
      )}

      <Text style={styles.disclaimer}>人ではなく、趣味だけが届きます。</Text>

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
  liveRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
    marginBottom: IbukiSpacing.xs,
  },
  livePulse: {
    backgroundColor: IbukiColors.hot,
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  modeRow: {
    alignItems: "flex-start",
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
