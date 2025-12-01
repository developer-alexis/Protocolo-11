import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { EmblemContext } from '@/app/context/EmblemContext.jsx'
import defaultTeamIcon from '@/assets/images/club.png'
import undoIcon from '@/assets/images/undo.png'
import resetIcon from '@/assets/images/reset.png'
import pauseIcon from '@/assets/images/pause.png'
import BluetoothService from '@/app/services/BluetoothService'

const Index = () => {
  const { localEmblem, visitorEmblem } = useContext(EmblemContext);

  // Variables de puntaje
  const [localScore, setLocalScore] = useState(0);
  const [visitorScore, setVisitorScore] = useState(0);

  // Contador principal
  const [mainSeconds, setMainSeconds] = useState(0);
  const [mainRunning, setMainRunning] = useState(false);
  const mainInterval = useRef(null);

  useEffect(() => {
    if (mainRunning) {
      mainInterval.current = setInterval(() => {
        setMainSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(mainInterval.current);
    }

    return () => clearInterval(mainInterval.current);
  }, [mainRunning]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Tiempo extra
  const [extraMinutesValue, setExtraMinutesValue] = useState(0); 
  const [extraSeconds, setExtraSeconds] = useState(0); 
  const [extraRunning, setExtraRunning] = useState(false);
  const extraInterval = useRef(null);

  useEffect(() => {
    if (extraRunning && extraSeconds > 0) {
      extraInterval.current = setInterval(() => {
        setExtraSeconds(prev => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      clearInterval(extraInterval.current);
    }

    return () => clearInterval(extraInterval.current);
  }, [extraRunning, extraSeconds]);

  // Función para enviar comando BLE
  const sendBLECommand = async (command) => {
    if (BluetoothService.isConnected()) {
      try {
        await BluetoothService.sendCommand(command);
      } catch (error) {
        console.error('Error enviando comando BLE:', error);
      }
    }
  };

  // Función para incrementar gol local
  const handleLocalGoal = () => {
    setLocalScore(prev => prev + 1);
    sendBLECommand('L'); // Enviar comando al ESP32
  };

  // Función para decrementar gol local
  const handleUndoLocalGoal = () => {
    setLocalScore(prev => {
      if (prev > 0) {
        sendBLECommand('l'); // Enviar comando al ESP32
        return prev - 1;
      }
      return prev;
    });
  };

  // Función para incrementar gol visitante
  const handleVisitorGoal = () => {
    setVisitorScore(prev => prev + 1);
    sendBLECommand('V'); // Enviar comando al ESP32
  };

  // Función para decrementar gol visitante
  const handleUndoVisitorGoal = () => {
    setVisitorScore(prev => {
      if (prev > 0) {
        sendBLECommand('v'); // Enviar comando al ESP32
        return prev - 1;
      }
      return prev;
    });
  };

  // Función para iniciar el tiempo
  const handleStartTimer = () => {
    setMainRunning(true);
    sendBLECommand('S'); // Enviar comando al ESP32
  };

  // Función para reiniciar todos los contadores
  const resetAll = () => {
    setMainRunning(false);
    setMainSeconds(0);
    setExtraRunning(false);
    setExtraSeconds(0);
    setExtraMinutesValue(0);
    setLocalScore(0);
    setVisitorScore(0);
    sendBLECommand('R'); // Enviar comando al ESP32
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>{formatTime(mainSeconds)}</Text>

      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>Local</Text>
          <Image
            style={styles.teamLogo}
            source={localEmblem || defaultTeamIcon}
          />
          <Text style={styles.score}>{localScore}</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.team}>
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>Visitante</Text>
          <Image
            style={styles.teamLogo}
            source={visitorEmblem || defaultTeamIcon}
          />
          <Text style={styles.score}>{visitorScore}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.goals}>
          <Pressable
            style={styles.goalButtons}
            onPress={handleLocalGoal}
          >
            <Text style={styles.goalButtonText}>Marcar gol local</Text>
          </Pressable>

          <Pressable
            style={styles.undoGoalButtons}
            onPress={handleUndoLocalGoal}
          >
            <Image style={styles.undoGoalIcon} source={undoIcon} />
          </Pressable>
        </View>

        <View style={styles.goals}>
          <Pressable
            style={styles.goalButtons}
            onPress={handleVisitorGoal}
          >
            <Text style={styles.goalButtonText}>Marcar gol visitante</Text>
          </Pressable>

          <Pressable
            style={styles.undoGoalButtons}
            onPress={handleUndoVisitorGoal}
          >
            <Image style={styles.undoGoalIcon} source={undoIcon} />
          </Pressable>
        </View>

        <View style={styles.timerActions}>
          <Pressable
            style={styles.startTimerButton}
            onPress={handleStartTimer}
          >
            <Text style={{ textAlign: 'center', fontWeight: 600, fontSize: 20 }}>
              Empezar tiempo
            </Text>
          </Pressable>

          <View style={styles.extraTimerActions}>
            <Pressable
              style={styles.addremoveTimeButtons}
              onPress={() => !extraRunning && setExtraMinutesValue(prev => Math.max(prev - 1, 0))}
            >
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>-</Text>
            </Pressable>

            <Text style={styles.extraTime}>
              {extraRunning
                ? formatTime(extraSeconds)
                : `${String(extraMinutesValue).padStart(2, '0')}:00`}
            </Text>

            <Pressable
              style={styles.addremoveTimeButtons}
              onPress={() => !extraRunning && setExtraMinutesValue(prev => prev + 1)}
            >
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>+</Text>
            </Pressable>
          </View>

          <View style={styles.extraTimerActions}>
            <Pressable
              style={styles.confirmExtraTimeButton}
              onPress={() => {
                if (extraMinutesValue === 0) return;
                setExtraSeconds(extraMinutesValue * 60);
                setExtraRunning(true);
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>Añadir tiempo extra</Text>
            </Pressable>

            <Pressable style={styles.undoGoalButtons} onPress={resetAll}>
              <Image style={styles.undoGoalIcon} source={resetIcon} />
            </Pressable>

            <Pressable
              style={styles.pauseTimerButton}
              onPress={() => setMainRunning(false)}
            >
              <Image style={styles.undoGoalIcon} source={pauseIcon} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

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
    justifyContent: 'center',
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
    width: 90,
    borderRadius: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '700',
    fontSize: 18,
    marginHorizontal: 10,
  },

  confirmExtraTimeButton: {
    backgroundColor: 'orange',
    padding: 10,
    marginRight: 20,
    borderRadius: 1000,
    justifyContent: 'center',
  },

  addremoveTimeButtons: {
    backgroundColor: 'orange',
    width: 40,
    height: 40,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },

  pauseTimerButton: {
    backgroundColor: 'orange',
    width: 40,
    height: 40,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    marginLeft: 10,
  },
});

export default Index;