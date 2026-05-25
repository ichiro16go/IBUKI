import React from "react";
import { View, StyleSheet } from "react-native";
import { IbukiColors, IbukiRadius } from "@/constants/ibuki-theme";

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
    // number of leaves grows with actions and stage
    const baseLeaves = stage === "seed" ? 0 : stage === "sprout" ? 2 : 4;
    const extraLeaves = Math.min(12, Math.floor(actionCount));
    const leaves = Math.min(12, baseLeaves + extraLeaves);

    const showFlower = actionCount >= 8 || stage === "leafy";

    const leafElems = [] as React.ReactNode[];
    for (let i = 0; i < leaves; i++) {
        const rotate = (i / Math.max(1, leaves)) * 180 - 90; // spread on both sides
        const sizeRatio = 0.26 + (i % 3) * 0.06;
        leafElems.push(
            <View
                key={`leaf-${i}`}
                style={[
                    styles.leaf,
                    {
                        backgroundColor: "#9fc9a6",
                        width: size * sizeRatio,
                        height: size * (sizeRatio * 0.6),
                        transform: [
                            { translateY: -size * 0.18 },
                            { rotate: `${rotate}deg` },
                            { translateY: size * 0.18 },
                        ],
                        borderRadius: Math.round(size * 0.2),
                        opacity: 0.95,
                    },
                ]}
            />,
        );
    }

    const flowerElem = showFlower ? (
        <View
            style={[
                styles.flower,
                flowerVariant === 1 && { backgroundColor: "#f6c0d0" },
                flowerVariant === 2 && { backgroundColor: "#ffd9b3" },
            ]}
        />
    ) : null;

    return (
        <View style={[styles.container, { height: size }]}>
            <View style={[styles.pot, { width: size * 0.6, height: size * 0.16 }]} />

            <View style={[styles.stemArea, { height: size * 0.7 }]}>
                <View style={[styles.stem, { height: size * 0.38 }]} />

                <View style={[styles.leavesContainer, { height: size * 0.4 }]}>
                    {leafElems}
                </View>

                {flowerElem}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
    pot: {
        backgroundColor: "#d9c7b8",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        marginBottom: 6,
    },
    stemArea: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
    stem: {
        width: 8,
        backgroundColor: "#7aa775",
        borderRadius: 4,
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
    flower: {
        width: 34,
        height: 34,
        borderRadius: 20,
        backgroundColor: "#f3a2c0",
        marginTop: 8,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.6)",
    },
});
