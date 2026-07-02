import React, { useEffect, useMemo, useRef, useState } from "react";
import {View, Text, Pressable, Modal, Animated, ScrollView, RefreshControl } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LevelBadge } from "../enums/LevelBadge";
import type { UserBadgesResponse } from "../responses/UserBadgesResponse";
import BadgeService from "../services/BadgeService";
import Loading from "../components/loading/Loading";
import ErrorCardInApp from "../components/card/ErrorCard";
import type { UserBadge } from "../models/Badge";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BadgeStyle } from "../styles/Badge_style";
import { SvgXml } from "react-native-svg";
import { formatTime } from "../utils/formatTime";

interface Props {
  badge : UserBadge | null,
}

const LEVEL_COLORS: Record<LevelBadge,{ bg: string; border: string; title: string; pillBg: string; pillText: string }> = {
  [LevelBadge.BEGINNER]: {
    bg: "#F0FDF4",
    border: "#86EFAC",
    title: "#15803D",
    pillBg: "#DCFCE7",
    pillText: "#15803D",
  },
  [LevelBadge.INTERMEDIATE]: {
    bg: "#EFF6FF",
    border: "#93C5FD",
    title: "#1D4ED8",
    pillBg: "#DBEAFE",
    pillText: "#1D4ED8",
  },
  [LevelBadge.ADVANCED]: {
    bg: "#F5F3FF",
    border: "#C4B5FD",
    title: "#6D28D9",
    pillBg: "#EDE9FE",
    pillText: "#6D28D9",
  },
  [LevelBadge.EXPERT]: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    title: "#B45309",
    pillBg: "#FEF3C7",
    pillText: "#B45309",
  },
};

const BadgeCard = ({badge}: Props) => {
  const [showTip, setShowTip] = useState(false);
  const isUnlocked = badge !== null;
  const colors = badge ? LEVEL_COLORS[badge.level_badge] : null;
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  const handlePress = () => {
    setShowTip((prev) => !prev);
  };

  useEffect(() => {
    if (!badge) return;
    let cancelled = false;

    const loadImage = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(badge.badge.badge_image_path, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        });
        const xml = await res.text(); // 👈 text, not blob
        if (!cancelled) setSvgXml(xml);
      } catch (err) {
        console.error(err);
      }
    };

    loadImage();
    return () => { cancelled = true; };
  }, [badge?.badge.badge_image_path]);

  return (
    <Pressable style={BadgeStyle.cardWrapper} onPress={handlePress}>
      <View
        style={[
          BadgeStyle.cardIcon,
          isUnlocked
            ? { backgroundColor: colors?.bg, borderColor: colors?.border }
            : BadgeStyle.cardIconLocked,
        ]}
      >
      {!isUnlocked ? (
        <Text style={BadgeStyle.cardEmoji}>❓</Text>
      ) : svgXml ? (
        <SvgXml xml={svgXml} width={40} height={40} />
      ) : (
        <Text>⏳</Text>
      )}
      </View>

      {isUnlocked && (
        <View style={[BadgeStyle.pill, { backgroundColor: colors?.pillBg }]}>
          <Text style={[BadgeStyle.pillText, { color: colors?.pillText }]}>
            {badge!.level_badge}
          </Text>
        </View>
      )}

      <Text
        style={[
          BadgeStyle.cardLabel,
          { color: isUnlocked ? colors?.title : "#A1A1AA" },
        ]}
        numberOfLines={1}
      >
        {isUnlocked ? badge!.badge.badge_title : "???"}
      </Text>

      {showTip && (
        <View
          style={[
            BadgeStyle.tooltip,
            { top: -(tooltipHeight + 12), opacity: tooltipHeight > 0 ? 1 : 0 },
          ]}
          onLayout={(e) => setTooltipHeight(e.nativeEvent.layout.height)}
        >
          <Text style={BadgeStyle.tooltipText}>
            {isUnlocked ? badge!.badge.badge_label : "Not unlocked yet"}
          </Text>
          <View style={BadgeStyle.tooltipArrow} />
        </View>
      )}
    </Pressable>
  );
};

// ---------------------------------------------------------------------------
// Badges screen
// ---------------------------------------------------------------------------
const Badges: React.FC = () => {
  const badgeService = BadgeService.getInstance();

  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [badgesMetaData, setBadgesMetaData] = useState<UserBadgesResponse | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<UserBadge[]>([]);
  const [current, setCurrent] = useState(0);
  const [showNoReward, setShowNoReward] = useState(false);
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(1)).current;
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!badgesMetaData?.nextGiftDate) return;

    const updateCountdown = () => {
      if(badgesMetaData.nextGiftDate == null) return
      const diff = badgesMetaData.nextGiftDate - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateCountdown(); // set immediately, don't wait 1s for first tick
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [badgesMetaData?.nextGiftDate]);

  const getAllBadges = async () => {
    try {
      const response = await badgeService.getAll();
      setBadgesMetaData(response);
      if (response.isNew && response.newBadges.length === 0) {
        setShowNoReward(true);
      }
      setCelebrationQueue(response.newBadges);
    } catch (error: any) {
      setHasError(true);
    }
  };

  useEffect(() => {
    setLoading(true);
    getAllBadges().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getAllBadges();
    setRefreshing(false);
  };

  const celebrating = useMemo(() => celebrationQueue.length > 0 && current < celebrationQueue.length, [celebrationQueue, current]);
  const activeBadge = useMemo(() => (celebrating ? celebrationQueue[current] : null), [celebrating, celebrationQueue, current]);
  const colors = useMemo(() => (activeBadge ? LEVEL_COLORS[activeBadge.level_badge as LevelBadge] : null), [activeBadge]);
  const isLast = useMemo(() => current + 1 >= celebrationQueue.length,[current, celebrationQueue]);

  useEffect(() => {
    if (!activeBadge) return;
    let cancelled = false;

    const loadImage = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(activeBadge.badge.badge_image_path, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        });
        const xml = await res.text(); // 👈 text, not blob
        if (!cancelled) setSvgXml(xml);
      } catch (err) {
        console.error(err);
      }
    };

    loadImage();
    return () => { cancelled = true; };
  }, [activeBadge?.badge.badge_image_path]);

  if (loading) {
    return <Loading />;
  }
  if (hasError || badgesMetaData == null) {
    return (
      <ErrorCardInApp
        iconBg="#F3F4F6"
        icon={<Icon name="close-circle-outline" size={32} color="#9CA3AF" />}
        title="Can't fetch badges"
        description="An error has occured try again later"
      />
    );
  }

  const handleNext = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (current + 1 >= celebrationQueue.length) {
        setCelebrationQueue([]);
        setCurrent(0);
      } else {
        setCurrent((prev) => prev + 1);
      }
      anim.setValue(1);
    });
  };

  const cardAnimatedStyle = {
    opacity: anim,
    transform: [
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
      },
    ],
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={BadgeStyle.header}>
        <Text style={BadgeStyle.headerTitle}>Your badges</Text>
        <Text style={BadgeStyle.headerSubtitle}>
          See the badges you have gain on the app.
        </Text>
      </View>

      {/* Celebration overlay */}
      <Modal visible={celebrating} transparent animationType="fade">
        <Pressable style={BadgeStyle.overlay} onPress={handleNext}>
          {activeBadge && (
            <Animated.View
              style={[
                BadgeStyle.celebrationCard,
                { backgroundColor: colors?.bg, borderColor: colors?.border },
                cardAnimatedStyle,
              ]}
            >
              <Text style={BadgeStyle.counter}>
                {current + 1} / {celebrationQueue.length}
              </Text>

              <View
                style={[
                  BadgeStyle.celebrationIcon,
                  { backgroundColor: colors?.bg, borderColor: colors?.border },
                ]}
              >
                { svgXml ? (
                  <SvgXml xml={svgXml} width={40} height={40} /> 
                ) : (
                  "⏳"
                )}
              </View>

              <View style={[BadgeStyle.pill, { backgroundColor: colors?.pillBg }]}>
                <Text style={[BadgeStyle.pillText, { color: colors?.pillText }]}>
                  {activeBadge.level_badge}
                </Text>
              </View>

              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={[BadgeStyle.celebrationTitle, { color: colors?.title }]}>
                  {activeBadge.badge.badge_title}
                </Text>
                <Text style={BadgeStyle.celebrationSubtitle}>
                  {activeBadge.badge.badge_label}
                </Text>
              </View>

              <Text style={BadgeStyle.tapHint}>{isLast ? "Tap to finish" : "Tap for next"}</Text>
            </Animated.View>
          )}
        </Pressable>
      </Modal>

      {/* No new badges modal */}
      <Modal visible={showNoReward} transparent animationType="fade">
        <Pressable style={BadgeStyle.overlay} onPress={() => setShowNoReward(false)}>
          <Pressable style={BadgeStyle.noRewardCard} onPress={() => {}}>
            <Text style={{ fontSize: 48 }}>🎁</Text>
            <Text style={BadgeStyle.noRewardTitle}>No new badges</Text>
            <Text style={BadgeStyle.noRewardSubtitle}>
              You didn't unlock anything new this time. Keep going!
            </Text>
            <Pressable style={BadgeStyle.noRewardButton} onPress={() => setShowNoReward(false)}>
              <Text style={BadgeStyle.noRewardButtonText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Badge grid */}
      {!celebrating && (
        <>
          <View style={BadgeStyle.grid}>
            {badgesMetaData.allBadges.map((badgeId) => (
              <BadgeCard
                key={badgeId}
                badge={
                  badgesMetaData.userBadge.find((b) => b.badge.uuid === badgeId) ?? null
                }
              />
            ))}
          </View>
          <Text style={BadgeStyle.unlockedCount}>
            {badgesMetaData.userBadge.length} / {badgesMetaData.allBadges.length} unlocked
          </Text>
          <Text style={[BadgeStyle.unlockedCount, { paddingTop: 4 }]}>
            {timeLeft > 0 ? formatTime(timeLeft) : "Reload to get your prize"}
          </Text>
        </>
      )}
    </ScrollView>
  );
};

export default Badges;
