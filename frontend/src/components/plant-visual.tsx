import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { IbukiColors } from "@/constants/ibuki-theme";

export type PlantStage = "seed" | "sprout" | "leafy";

const plantVariants = [
    {
        leafPalette: ["#94c495", "#b0d2aa", "#7db27f", "#c4d9bc"],
        stemColor: "#7ca16a",
        potColor: "#d8c1a8",
        flowerColor: "#f3b6c5",
        crownColor: "rgba(169,209,165,0.9)",
    },
    {
        leafPalette: ["#8fbf8b", "#a8d0a0", "#75aa70", "#bfdbb5"],
        stemColor: "#6f9a61",
        potColor: "#d1b59f",
        flowerColor: "#f8d09a",
        crownColor: "rgba(153,199,135,0.92)",
    },
    {
        leafPalette: ["#b0d5b2", "#c5e0c6", "#95bd8a", "#d0e5cf"],
        stemColor: "#82b073",
        potColor: "#d9c6ab",
        flowerColor: "#e3b8c6",
        crownColor: "rgba(186,219,178,0.9)",
    },
];

const growthConfig = [
    { leaves: [], seed: true, flower: false },
    {
        leaves: [
            { angle: -45, radiusFactor: 0.22, widthFactor: 0.18 },
            { angle: 45, radiusFactor: 0.22, widthFactor: 0.18 },
        ],
        seed: false,
        flower: false,
    },
    {
        leaves: [
            { angle: -65, radiusFactor: 0.24, widthFactor: 0.2 },
            { angle: -25, radiusFactor: 0.2, widthFactor: 0.18 },
            { angle: 25, radiusFactor: 0.2, widthFactor: 0.18 },
            { angle: 65, radiusFactor: 0.24, widthFactor: 0.2 },
        ],
        seed: false,
        flower: false,
    },
    {
        leaves: [
            { angle: -80, radiusFactor: 0.26, widthFactor: 0.2 },
            { angle: -45, radiusFactor: 0.22, widthFactor: 0.18 },
            { angle: 0, radiusFactor: 0.16, widthFactor: 0.18 },
            { angle: 45, radiusFactor: 0.22, widthFactor: 0.18 },
            { angle: 80, radiusFactor: 0.26, widthFactor: 0.2 },
        ],
        seed: false,
        flower: false,
    },
    {
        leaves: [
            { angle: -90, radiusFactor: 0.28, widthFactor: 0.2 },
            { angle: -60, radiusFactor: 0.24, widthFactor: 0.19 },
            { angle: -30, radiusFactor: 0.2, widthFactor: 0.18 },
            { angle: 0, radiusFactor: 0.16, widthFactor: 0.18 },
            { angle: 30, radiusFactor: 0.2, widthFactor: 0.18 },
            { angle: 60, radiusFactor: 0.24, widthFactor: 0.19 },
            { angle: 90, radiusFactor: 0.28, widthFactor: 0.2 },
        ],
        seed: false,
        flower: true,
    },
];

export default function PlantVisual({
    actionCount,
    stage = "seed",
    plantType = 0,
    size = 180,
    itemLevel,
}: {
    actionCount: number;
    stage?: PlantStage;
    plantType?: number;
    size?: number;
    itemLevel?: number;
}) {
    // If `itemLevel` is provided (preferred), use it directly (0-based).
    // Otherwise compute growth level from stage/actionCount as before.
    let growthLevel: number;
    if (typeof itemLevel === "number") {
        growthLevel = Math.max(0, Math.min(4, Math.floor(itemLevel)));
    } else {
        const baseLevel = stage === "seed" ? 0 : stage === "sprout" ? 1 : 2;
        growthLevel = Math.min(4, baseLevel + Math.floor(actionCount / 2));
    }

    // Static image assets (5 stages). Currently only `suki_phase1..5.png` are provided.
    // Map plant types to variants here — fallback to 'suki' for all types if others missing.
    const variantName = "suki";
    const IMAGES = {
        suki: [
            require("../../assets/images/plant_growth/suki_phase1.png"),
            require("../../assets/images/plant_growth/suki_phase2.png"),
            require("../../assets/images/plant_growth/suki_phase3.png"),
            require("../../assets/images/plant_growth/suki_phase4.png"),
            require("../../assets/images/plant_growth/suki_phase5.png"),
        ],
    } as const;

    const variantImages = (IMAGES as any)[variantName];

    if (variantImages && variantImages[growthLevel]) {
        const source = variantImages[growthLevel];
        return (
            <View style={[styles.container, { width: size, height: size * 1.05 }]}>
                <Image
                    source={source}
                    style={{ width: size, height: size * 1.05, resizeMode: "contain" }}
                />
            </View>
        );
    }

    // Fallback to simple procedural rendering if images are not available.
    // (Keep a minimal version of the prior procedural drawing to avoid blank UI.)
    const variant = plantVariants[plantType % plantVariants.length];
    const config = growthConfig[growthLevel];

    const leafElems = config.leaves.map((leaf, index) => {
        const angleRad = (leaf.angle * Math.PI) / 180;
        const radius = size * leaf.radiusFactor;
        const translateX = Math.cos(angleRad) * radius;
        const translateY = Math.sin(angleRad) * radius * 0.74;
        const width = size * leaf.widthFactor;

        return (
            <View
                key={`leaf-${index}`}
                style={[
                    styles.leaf,
                    {
                        width,
                        height: width * 0.56,
                        left: size * 0.5 - width * 0.5,
                        top: size * 0.2,
                        backgroundColor: variant.leafPalette[index % variant.leafPalette.length],
                        transform: [
                            { translateX },
                            { translateY },
                            { rotate: `${leaf.angle + 90}deg` },
                        ],
                        borderRadius: width * 0.42,
                    },
                ]}
            />
        );
    });

    const seedElem = config.seed ? (
        <View
            style={[
                styles.seed,
                {
                    width: size * 0.12,
                    height: size * 0.12,
                    borderRadius: size * 0.06,
                    left: size * 0.5 - size * 0.06,
                    top: size * 0.2,
                },
            ]}
        />
    ) : null;

    const flowerElem = config.flower ? (
        <View
            style={[
                styles.flower,
                {
                    width: size * 0.14,
                    height: size * 0.14,
                    borderRadius: size * 0.07,
                    backgroundColor: variant.flowerColor,
                    marginTop: size * 0.02,
                    borderColor: "rgba(255,255,255,0.65)",
                },
            ]}
        />
    ) : null;

    return (
        <View style={[styles.container, { width: size, height: size * 1.05 }]}>
            <View style={[styles.leafStage, { height: size * 0.58 }]}>
                {leafElems}
                {seedElem}
                <View style={[styles.crown, { width: size * 0.44, height: size * 0.16 }]}>
                    <View style={[styles.crownLeaf, { left: size * 0.05, top: size * 0.01, backgroundColor: variant.crownColor }]} />
                    <View style={[styles.crownLeaf, { right: size * 0.05, top: size * 0.01, backgroundColor: variant.crownColor }]} />
                    <View style={[styles.crownLeaf, { left: size * 0.17, top: size * 0.08, backgroundColor: variant.crownColor }]} />
                    <View style={[styles.crownLeaf, { right: size * 0.17, top: size * 0.08, backgroundColor: variant.crownColor }]} />
                </View>
            </View>
            {flowerElem}
            <View style={[styles.stem, { backgroundColor: variant.stemColor, height: size * 0.22 }]} />
            <View style={[styles.pot, { backgroundColor: variant.potColor, width: size * 0.6, height: size * 0.14 }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
    leafStage: {
        width: "100%",
        position: "relative",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    leaf: {
        position: "absolute",
        shadowColor: IbukiColors.mid,
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    seed: {
        position: "absolute",
        backgroundColor: "#e7d7a5",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.7)",
    },
    crown: {
        position: "absolute",
        top: "30%",
        alignItems: "center",
        justifyContent: "center",
    },
    crownLeaf: {
        position: "absolute",
        width: "28%",
        height: "40%",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
    },
    stem: {
        width: 12,
        borderRadius: 6,
        marginTop: 8,
    },
    pot: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        marginBottom: 6,
    },
    flower: {
        borderWidth: 2,
    },
});
