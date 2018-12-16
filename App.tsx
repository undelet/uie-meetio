import React from 'react'
import { ViewStyle, Dimensions, View as RNView } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'

const { cond, eq, add, set, Value, event, View, startClock, clockRunning, timing, debug, stopClock, Clock } = Animated
const { width, height } = Dimensions.get('window')
enum Direction {
  LEFT,
  RIGHT
}
interface IState {
  nextDirection: Direction
}

function runTiming() {
  return new Value(0)
}

function runTiming2(clock, value, dest) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0)
  }

  const config = {
    duration: 5000,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease)
  }

  return [
    cond(clockRunning(clock), 0, [
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
  ]
}

export default class App extends React.Component<void, IState> {
  public state = {
    nextDirection: Direction.RIGHT
  }

  private clock = new Clock()
  private translateX = runTiming2(this.clock, -120, 120)

  public render() {
    return (
      <RNView style={styles.container}>
        <RNView style={{ flex: 1, width: '100%' }}>
          <View
            style={[
              styles.box1,
              {
                transform: [{ translateX: this.translateX }]
              }
            ]}
          />
          <View
            style={[
              styles.box2,
              {
                transform: []
              }
            ]}
          />
          <View
            style={[
              styles.box3,
              {
                transform: []
              }
            ]}
          />
          <View
            style={[
              styles.box4,
              {
                transform: []
              }
            ]}
          />
        </RNView>
      </RNView>
    )
  }
}

const CIRCLE_SIZE = 70

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column'
  } as ViewStyle,
  box: {
    backgroundColor: 'tomato',
    marginLeft: -(CIRCLE_SIZE / 2),
    marginTop: -(CIRCLE_SIZE / 2),
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderColor: '#000'
  },
  box1: {
    flex: 1,
    width: '100%',
    backgroundColor: 'red'
  },
  box2: {
    flex: 1,
    width: '100%',
    backgroundColor: 'green'
  },
  box3: {
    flex: 1,
    width: '100%',
    backgroundColor: 'blue'
  },
  box4: {
    flex: 1,
    width: '100%',
    backgroundColor: 'yellow'
  }
}
