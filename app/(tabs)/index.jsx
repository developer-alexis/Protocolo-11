import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import React from 'react'
import defaultTeamIcon from '@/assets/images/club.png'
import undoIcon from '@/assets/images/undo.png'
import resetIcon from '@/assets/images/reset.png'

const index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>00:00</Text>

      <View style={styles.teamsRow}>

        <View style={styles.team}>
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>Local</Text>

          <Image
            style={styles.teamLogo}
            source={defaultTeamIcon}
          />

          <Text style={styles.score}>0</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.team}>
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>Visitante</Text>

          <Image
            style={styles.teamLogo}
            source={defaultTeamIcon}
          />

          <Text style={styles.score}>0</Text>
        </View>

      </View>

      <View style={styles.actions}>
        <View style={styles.goals}>
          <Pressable style={styles.goalButtons}>
            <Text style={styles.goalButtonText}>Marcar gol local</Text>
          </Pressable>
          <Pressable style={styles.undoGoalButtons}>
            <Image style={styles.undoGoalIcon} source={undoIcon} />
          </Pressable>
        </View>

        <View style={styles.goals}>
          <Pressable style={styles.goalButtons}>
            <Text style={styles.goalButtonText}>Marcar gol visitante</Text>
          </Pressable>
          <Pressable style={styles.undoGoalButtons}>
            <Image style={styles.undoGoalIcon} source={undoIcon} />
          </Pressable>
        </View>

        <View style={styles.timerActions}>
          <Pressable style={styles.startTimerButton}>
            <Text style={{ textAlign: 'center', fontWeight: 600, fontSize: 20 }}>Empezar tiempo</Text>
          </Pressable>
          <View style={styles.extraTimerActions}>
            <Pressable style={styles.addremoveTimeButtons}>
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>-</Text>
            </Pressable>
            <Text style={styles.extraTime}>00:00</Text>
            <Pressable style={styles.addremoveTimeButtons}>
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>+</Text>
            </Pressable>
          </View>
          <View style={styles.extraTimerActions}>
            <Pressable style={styles.confirmExtraTimeButton}>
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>Añadir tiempo extra</Text>
            </Pressable>
            <Pressable style={styles.undoGoalButtons}>
              <Image style={styles.undoGoalIcon} source={resetIcon} />
            </Pressable>
          </View>
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },

  teamsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },

  team: {
    width: '30%',
    alignItems: 'center',
  },

  teamLogo: {
    width: 120,
    height: 120,
    marginTop: 10,
    resizeMode: 'contain',
  },

  vsText: {
    color: 'red',
    fontSize: 40,
    fontWeight: '900',
  },

  score: {
    fontSize: 60,
    fontWeight: '900',
  },

  actions: {
    padding: 10,
  },

  goals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },

  goalButtons: {
    backgroundColor: 'black',
    width: 200,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center'
  },

  goalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center'
  },

  undoGoalButtons: {
    backgroundColor: 'orange',
    width: 40,
    height: 40,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },

  undoGoalIcon: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  startTimerButton: {
    backgroundColor: 'orange',
    padding: 20,
    borderRadius: 200,
  },

  extraTimerActions: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  extraTime: {
    backgroundColor: 'black',
    color: 'white',
    height: 40,
    width: 70,
    borderRadius: 10,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  confirmExtraTimeButton: {
    backgroundColor: 'orange',
    textAlign: 'center',
    justifyContent: 'center',
    padding: 10,
    marginRight: 20,
    borderRadius: 1000
  },

    addremoveTimeButtons: {
    backgroundColor: 'orange',
    width: 40,
    height: 40,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
})

export default index