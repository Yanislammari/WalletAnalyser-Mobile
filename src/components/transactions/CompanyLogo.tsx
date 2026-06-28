import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LOGODEV_API_KEY } from "../../constants/env";

interface CompanyLogoProps {
  name: string;
  size?: number;
}

const CompanyLogo: React.FC<CompanyLogoProps> = (props) => {
  const [failed, setFailed] = useState<boolean>(false);
  const size = props.size ?? 40;

  const slug = encodeURIComponent(props.name.toLowerCase().trim());
  const src = `https://img.logo.dev/name/${slug}?token=${LOGODEV_API_KEY}&size=40&format=png`;

  const initials = props.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (failed || !LOGODEV_API_KEY) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size * 0.2 },
        ]}
      >
        <Text style={{ fontSize: size * 0.4, fontWeight: "600", color: "#6b7280" }}>
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      onError={() => setFailed(true)}
      style={[
        styles.image,
        { width: size, height: size, borderRadius: size * 0.2 },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
});

export default CompanyLogo;