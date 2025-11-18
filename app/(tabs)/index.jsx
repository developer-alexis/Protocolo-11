import { View, Text, StyleSheet, Image, Button, Pressable } from 'react-native'
import React from 'react'
import defaultTeamIcon from '@/assets/images/club.png'

const index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>00:00</Text>

      <View style={styles.teamsRow}>

        <View style={styles.team}>
          <Text style={{ textAlign: 'center', fontWeight: 600 }}>Local</Text>
          <Image
            style={styles.teamLogo}
            source={defaultTeamIcon}
          />
          <Text style={styles.score}>0</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.team}>
          <Text style={{ textAlign: 'center', fontWeight: 600 }}>Visitante</Text>
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
            <Text>Marcar gol local</Text>
          </Pressable>
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(220, 220, 220)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamsRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '80vw',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px;'
  },
  team: {
    width: '30vw',
    alignItems: 'center',
  },
  teamLogo: {
    width: '120px',
    height: '120px',
    marginTop: '10px',
    objectFit: 'contain',
  },
  vsText: {
    color: 'red',
    fontSize: '2.5rem',
    fontWeight: 900,
  },
  score: {
    fontSize: '2.5rem',
    fontWeight: 900,
  },
  actions: {
    padding: '10px',
  },
  goals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalButtons: {
    borderRadius: '20px',
    backgroundColor: 'red',
  }
});

export default index