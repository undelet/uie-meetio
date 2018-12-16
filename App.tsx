import React from 'react'
import { View, ViewStyle, Dimensions, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler'

const { Clock, Value, set, cond, startClock, clockRunning, timing, debug, stopClock, block, interpolate } = Animated

const { width: windowWidth, height: windowHeight } = Dimensions.get('window')
const HEADER_HEIGHT = 150
const FOOTER_HEIGHT = 50
const BOX_RADIUS = 75

function runTiming(clock, value, dest, state, config) {
  return block([
    cond(clockRunning(clock), 100, [
      // If the clock isn't running we reset all the animation params and start the clock
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    // we run the step here that is going to update position
    timing(clock, state, config),
    // if the animation is over we stop the clock
    cond(state.finished, debug('stop clock', stopClock(clock))),
    // we made the block return the updated position
    state.position
  ])
}

enum Direction {
  LEFT,
  RIGHT
}

export default class AnimatedBox extends React.Component<
  void,
  { direction: Direction; translateX: Animated.Node<number> }
> {
  public readonly clock = new Clock()

  public animState = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0)
  }

  public animConfigToRight = {
    duration: 500,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease)
  }

  public animConfigToLeft = {
    duration: 500,
    toValue: new Value(windowWidth),
    easing: Easing.inOut(Easing.ease)
  }

  public state = {
    direction: Direction.RIGHT,
    translateX: undefined
  }

  private x: number

  public run = (direction: Direction) => {
    if (direction === this.state.direction) return
    // console.log(this.state)
    this.animState.position.setValue(direction === Direction.LEFT ? windowWidth : 0)
    this.setState({
      direction: direction === Direction.LEFT ? Direction.RIGHT : Direction.LEFT,
      translateX: runTiming(
        new Clock(),
        direction === Direction.LEFT ? windowWidth : 0,
        direction === Direction.LEFT ? 0 : windowWidth,
        this.animState,
        direction === Direction.LEFT ? this.animConfigToLeft : this.animConfigToRight
      )
    })
  }

  // public componentDidMount = () => {
  //   this.run()
  //   setInterval(this.run, 4500)
  // }

  public translateXBoxN = n =>
    this.state.translateX === undefined
      ? new Value(0)
      : interpolate(this.state.translateX, {
          inputRange: [0, (windowWidth / 30) * n * 2, windowWidth],
          outputRange: [0, 0, windowWidth]
        })

  public render() {
    return (
      <FlingGestureHandler
        direction={Directions.RIGHT | Directions.LEFT}
        onHandlerStateChange={({ nativeEvent: { state, x, absoluteX } }) => {
          console.log(`${state} ${x} ${absoluteX}`)
          if (state === State.ACTIVE) {
            console.log(`BEGAN: ${x} ${absoluteX}`)
            this.x = x
          } else if (state === State.END) {
            this.run(x > this.x ? Direction.RIGHT : Direction.LEFT)
            console.log(`END: ${x}`)
            console.log(x > this.x ? 'right' : 'left')
          }
        }}
      >
        <View style={styles.container}>
          <View style={styles.page}>
            <Animated.View style={[styles.header]} />
            <Animated.View style={[styles.box, styles.box1, { backgroundColor: 'rgb(189, 203, 73)' }]} />
            <Animated.View style={[styles.box, styles.box2, { backgroundColor: 'rgb(75, 146, 24)' }]} />
            <Animated.View style={[styles.box, styles.box3, { backgroundColor: 'rgb(25, 53, 1)' }]} />
            <Animated.View style={[styles.footer, { backgroundColor: 'rgb(165, 183, 156)' }]} />
          </View>

          <View style={styles.page}>
            <Animated.View style={[styles.header]} />
            <Animated.View style={[styles.box, styles.box1, { transform: [{ translateX: this.translateXBoxN(2) }] }]} />
            <Animated.View style={[styles.box, styles.box2, { transform: [{ translateX: this.translateXBoxN(1) }] }]} />
            <Animated.View style={[styles.box, styles.box3, { transform: [{ translateX: this.translateXBoxN(0) }] }]} />
            <Animated.View
              style={[
                styles.footer,
                { backgroundColor: 'rgb(48, 33, 65)', transform: [{ translateX: this.translateXBoxN(0) }] }
              ]}
            />
          </View>
          {/* <TouchableOpacity onPress={this.run} style={{ zIndex: 1000, width: '100%', height: '100%' }}>
            <View />
          </TouchableOpacity> */}
        </View>
      </FlingGestureHandler>
    )
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column'
  } as ViewStyle,
  page: {
    ...StyleSheet.absoluteFillObject
  },
  header: {
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: 'rgb(255, 255, 255)',
    borderBottomStartRadius: BOX_RADIUS,
    zIndex: 4
  } as ViewStyle,
  box: {
    width: '100%',
    height: (windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT) / 3 + BOX_RADIUS,
    borderBottomStartRadius: BOX_RADIUS,
    position: 'absolute'
  } as ViewStyle,
  box1: {
    backgroundColor: 'rgb(212,114,158)',
    top: HEADER_HEIGHT - BOX_RADIUS,
    zIndex: 3
  },
  box2: {
    backgroundColor: 'rgb(131,70,177)',
    top: HEADER_HEIGHT + (windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT) / 3 - BOX_RADIUS,
    zIndex: 2
  },
  box3: {
    backgroundColor: 'rgb(21,6,39)',
    top: HEADER_HEIGHT + ((windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT) / 3) * 2 - BOX_RADIUS,
    zIndex: 1
  },
  footer: {
    width: '100%',
    height: FOOTER_HEIGHT + BOX_RADIUS,
    position: 'absolute',
    bottom: 0
  } as ViewStyle
}
