import React from "react";
import { View, StyleSheet } from "react-native";
import { IbukiColors } from "@/constants/ibuki-theme";

export type PlantStage = "seed" | "sprout" | "leafy";

export default function PlantVisual({
    actionCount,
    stage = "seed",
    flowerVariant = 0,
    size = 180,
}: {
    actionCount: number;
    stage?: PlantStage;
    flowerVariant?: number; // 0..2
    size?: number;
}) {
    const stageBase = stage === "seed" ? 0 : stage === "sprout" ? 4 : 6;
    const leafCount = Math.min(14, stageBase + Math.max(0, Math.floor(actionCount / 1.5)));
    const showFlower = actionCount >= 10 || stage === "leafy";

    const leafColors = ["#98c9a2", "#7fb37f", "#adcfa1", "#b1d5b2"];
    const leafElems = Array.from({ length: leafCount }, (_, index) => {
        const angle = (index / Math.max(1, leafCount - 1)) * 160 - 80;
        const layer = Math.floor(index / 4);
        const width = size * (0.22 + layer * 0.08);
        const height = width * 0.56;
        const color = leafColors[index % leafColors.length];
        const offset = size * 0.035 * (index % 4);

        return (
            <View
                key={`leaf-${index}`}
                style={[
                    styles.leaf,
                    {
                        width,
                        height,
                        backgroundColor: color,
                        opacity: 0.96,
                        transform: [
                            { translateY: -size * 0.17 - offset },
                            { rotate: `${angle}deg` },
                            { translateY: size * 0.17 + offset },
                        ],
                        borderRadius: width * 0.45,
                    },
                ]}
            />
        );
    });

    const crown = (
        <View style={[styles.crown, { width: size * 0.48, height: size * 0.2 }]}>
            <View style={[styles.crownLeaf, { left: size * 0.06, top: 0 }]} />
            <View style={[styles.crownLeaf, { right: size * 0.06, top: 0 }]} />
            <View style={[styles.crownLeaf, { left: size * 0.18, top: size * 0.06 }]} />
            <View style={[styles.crownLeaf, { right: size * 0.18, top: size * 0.06 }]} />
        </View>
    );

    const flowerElem = showFlower ? (
        <View
            style={[
                styles.flower,
                flowerVariant === 1 && { backgroundColor: "#e8a8bf" },
                flowerVariant === 2 && { backgroundColor: "#f7d5a1" },
            ]}
        />
    ) : null;

    return (
        <View style={[styles.container, { height: size }]}>
            <View style={[styles.stemArea, { height: size * 0.78 }]}>
                <View style={[styles.leavesContainer, { height: size * 0.55 }]}>
                    {leafElems}
                    {crown}
                </View>

                {flowerElem}
                <View style={[styles.stem, { height: size * 0.28 }]} />
            </View>
            <View style={[styles.pot, { width: size * 0.58, height: size * 0.14 }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
    stemArea: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
    leavesContainer: {
        position: "relative",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
    },
    leaf: {
        position: "absolute",
        left: "50%",
        marginLeft: -20,
        shadowColor: IbukiColors.mid,
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    crown: {
        position: "absolute",
        top: -12,
        alignItems: "center",
        justifyContent: "center",
    },
    crownLeaf: {
        position: "absolute",
        width: "30%",
        height: "45%",
        borderRadius: 999,
        backgroundColor: "rgba(163,210,156,0.95)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },
    stem: {
        width: 10,
        backgroundColor: "#79a672",
        borderRadius: 5,
        marginTop: 8,
    },
    pot: {
        backgroundColor: "#d7c4ae",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 6,
    },
    flower: {
        width: 40,
        height: 40,
        borderRadius: 22,
        backgroundColor: "#f3a2c0",
        marginTop: 10,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.55)",
    },
});