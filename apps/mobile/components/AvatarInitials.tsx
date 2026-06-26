import React from "react";
import { Image, View, Text } from "react-native";

/**
 * Lấy 1-2 chữ cái đầu tiên từ tên đầy đủ
 * Ví dụ: "Nguyễn Văn A" → "NA", "ThinhNH" → "T"
 */
function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Tạo màu nền từ tên — giống cách Google tạo màu avatar
 */
function getColorFromName(name: string): string {
  const colors = [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
    "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
    "#FFC107", "#FF9800", "#FF5722", "#795548",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface AvatarInitialsProps {
  name?: string;
  avatarUrl?: string;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  fontSize?: number;
}

/**
 * Avatar component kiểu Google:
 * - Nếu có `avatarUrl` hợp lệ → hiển thị ảnh
 * - Nếu không → hiển thị chữ cái đầu tên trên nền màu
 */
export default function AvatarInitials({
  name = "",
  avatarUrl,
  size = 48,
  borderWidth = 0,
  borderColor = "transparent",
  fontSize,
}: AvatarInitialsProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const computedFontSize = fontSize ?? Math.round(size * 0.38);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
    overflow: "hidden" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: bgColor,
  };

  if (avatarUrl && avatarUrl.startsWith("http")) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text
        style={{
          color: "#fff",
          fontSize: computedFontSize,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
