import React, { Component, type PropsWithChildren } from "react";
import { Animated, I18nManager, StyleSheet, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MaterialCommunityIcons } from "react-native-vector-icons";

const AnimatedView = Animated.createAnimatedComponent(View);

interface Props {
  handleDelete: () => Promise<void>;
}

export default class GmailStyleSwipeableRow extends Component<
  PropsWithChildren<Props>
> {
  private swipeableRow?: Swipeable;

  render() {
    const { children, handleDelete } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={5}
        leftThreshold={40}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        onSwipeableWillOpen={() => {
          handleDelete().finally(() => {
            this.swipeableRow?.close();
          });
        }}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}
      >
        {children}
      </Swipeable>
    );
  }

  private renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
    return (
      <RectButton style={styles.leftAction} onPress={this.close}>
        {/* Change it to some icons */}
        <AnimatedView style={[styles.actionIcon, { transform: [{ scale }] }]}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color="white"
          />
        </AnimatedView>
      </RectButton>
    );
  };

  private renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    return (
      <RectButton style={styles.rightAction} onPress={this.close}>
        {/* Change it to some icons */}
        <AnimatedView style={[styles.actionIcon, { transform: [{ scale }] }]}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color="white"
          />
        </AnimatedView>
      </RectButton>
    );
  };

  private updateRef = (ref: Swipeable) => {
    this.swipeableRow = ref;
  };

  private close = () => {
    this.swipeableRow?.close();
  };
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: "#dd2c00",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
    height: 20,
  },
  rightAction: {
    alignItems: "center",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    backgroundColor: "#dd2c00",
    flex: 1,
    justifyContent: "flex-end",
  },
});
