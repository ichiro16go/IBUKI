import { Modal, StyleSheet, Text, View } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiShadow,
  IbukiSpacing,
  PhoneMaxWidth,
} from "@/constants/ibuki-theme";
import type { Hobby } from "@/data/ibuki";

import { AppSymbol } from "./_internal";
import { PillButton } from "./buttons";
import { PhotoBlock } from "./cards";
import { Heading, Kicker } from "./typography";

export function NotificationModal({
  visible,
  hobby,
  onClose,
  onOpen,
}: {
  visible: boolean;
  hobby: Hobby;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.notificationMap}>
          <MapLines />
          <View style={styles.toast}>
            <AppSymbol
              name={{
                ios: "sparkles",
                android: "auto_awesome",
                web: "sparkles",
              }}
              size={16}
              tintColor={IbukiColors.accentDeep}
            />
            <View style={styles.toastCopy}>
              <Kicker>IBUKI · NOW</Kicker>
              <Text style={styles.toastTitle}>すれ違いで 1枚 届きました</Text>
            </View>
            <Text style={styles.cardSubtitle}>3秒前</Text>
          </View>
          <View style={styles.notificationCard}>
            <Kicker>NEW · NO. {hobby.number}</Kicker>
            <PhotoBlock hobby={hobby} height={150} label="dusk walk" />
            <Heading size="medium">{hobby.nameJa}</Heading>
            <Text style={styles.cardSubtitle}>
              {hobby.nameEn} · {hobby.distance}
            </Text>
            <Text style={styles.quoteText}>"{hobby.quote}"</Text>
            <View style={styles.modalActions}>
              <PillButton
                label="あとで"
                onPress={onClose}
                style={styles.modalButton}
              />
              <PillButton
                label="カードを開く"
                variant="dark"
                icon={{
                  ios: "arrow.right",
                  android: "arrow_forward",
                  web: "arrow.right",
                }}
                onPress={onOpen}
                style={styles.modalButtonWide}
              />
            </View>
            <Text style={styles.privacyText}>
              相手のプロフィールや本名は表示されません
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MapLines() {
  return (
    <View style={styles.mapLines}>
      <View style={[styles.mapRoad, styles.mapRoadOne]} />
      <View style={[styles.mapRoad, styles.mapRoadTwo]} />
      <View style={[styles.mapRoad, styles.mapRoadThree]} />
      <View style={styles.mapWater} />
      <View style={styles.mapPark} />
      <Text style={[styles.mapLabel, { top: 72, left: 28 }]}>代々木公園</Text>
      <Text style={[styles.mapLabel, { bottom: 120, right: 34 }]}>恵比寿</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSubtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  quoteText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(46,38,32,0.22)",
    flex: 1,
    justifyContent: "center",
  },
  notificationMap: {
    backgroundColor: IbukiColors.mapLand,
    borderRadius: IbukiRadius.xl,
    height: "88%",
    maxHeight: 760,
    maxWidth: PhoneMaxWidth,
    overflow: "hidden",
    padding: IbukiSpacing.lg,
    position: "relative",
    width: "92%",
  },
  mapLines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: IbukiColors.mapLand,
  },
  mapRoad: {
    backgroundColor: IbukiColors.mapRoad,
    borderRadius: IbukiRadius.pill,
    height: 34,
    opacity: 0.82,
    position: "absolute",
    width: 500,
  },
  mapRoadOne: {
    left: -70,
    top: 180,
    transform: [{ rotate: "-24deg" }],
  },
  mapRoadTwo: {
    left: -40,
    top: 420,
    transform: [{ rotate: "18deg" }],
  },
  mapRoadThree: {
    left: -120,
    top: 310,
    transform: [{ rotate: "72deg" }],
  },
  mapWater: {
    backgroundColor: IbukiColors.mapWater,
    borderRadius: 80,
    height: 180,
    position: "absolute",
    right: -30,
    top: 70,
    width: 130,
  },
  mapPark: {
    backgroundColor: IbukiColors.mapPark,
    borderRadius: 80,
    bottom: 130,
    height: 170,
    left: -50,
    position: "absolute",
    width: 150,
  },
  mapLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
    position: "absolute",
  },
  toast: {
    alignItems: "center",
    backgroundColor: "rgba(247,243,234,0.93)",
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.sm,
  },
  toastCopy: {
    flex: 1,
  },
  toastTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 13,
    fontWeight: "700",
  },
  notificationCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    marginTop: "auto",
    padding: IbukiSpacing.lg,
    ...IbukiShadow.card,
  },
  modalActions: {
    flexDirection: "row",
    gap: IbukiSpacing.xs,
    marginTop: IbukiSpacing.xs,
  },
  modalButton: {
    flex: 0.82,
  },
  modalButtonWide: {
    flex: 1.18,
  },
  privacyText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
