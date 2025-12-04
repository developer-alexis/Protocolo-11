import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native'
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
  const [isPaused, setIsPaused] = useState(false);
  const mainInterval = useRef(null);

  useEffect(() => {
    if (mainRunning && !isPaused) {
      mainInterval.current = setInterval(() => {
        setMainSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(mainInterval.current);
    }

    return () => clearInterval(mainInterval.current);
  }, [mainRunning, isPaused]);

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
    sendBLECommand('L');
  };

  // Función para decrementar gol local
  const handleUndoLocalGoal = () => {
    setLocalScore(prev => {
      if (prev > 0) {
        sendBLECommand('l');
        return prev - 1;
      }
      return prev;
    });
  };

  // Función para incrementar gol visitante
  const handleVisitorGoal = () => {
    setVisitorScore(prev => prev + 1);
    sendBLECommand('V');
  };

  // Función para decrementar gol visitante
  const handleUndoVisitorGoal = () => {
    setVisitorScore(prev => {
      if (prev > 0) {
        sendBLECommand('v');
        return prev - 1;
      }
      return prev;
    });
  };

  // Función para iniciar el tiempo
  const handleStartTimer = () => {
    if (!mainRunning) {
      setMainRunning(true);
      setIsPaused(false);
      sendBLECommand('S');
    }
  };

  // Función para pausar/reanudar
  const handlePauseToggle = () => {
    if (mainRunning || isPaused) {
      setIsPaused(prev => !prev);
      sendBLECommand('P');
    }
  };

  // Función para añadir tiempo extra
  const handleAddExtraTime = () => {
    const currentMinutes = Math.floor(mainSeconds / 60);
    
    // Validar que esté en 45:00 o 90:00
    if (currentMinutes !== 45 && currentMinutes !== 90) {
      Alert.alert(
        'Tiempo extra no disponible',
        'Solo puedes añadir tiempo extra cuando el reloj marque 45:00 (final del primer tiempo) o 90:00 (final del segundo tiempo).',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (extraMinutesValue === 0) {
      Alert.alert(
        'Minutos requeridos',
        'Debes seleccionar al menos 1 minuto de tiempo extra.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirmar antes de añadir
    Alert.alert(
      'Confirmar tiempo extra',
      `¿Añadir ${extraMinutesValue} minuto${extraMinutesValue > 1 ? 's' : ''} de tiempo extra?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setExtraSeconds(extraMinutesValue * 60);
            setExtraRunning(true);
            // Enviar comando E seguido de los minutos
            sendBLECommand('E' + extraMinutesValue);
          }
        }
      ]
    );
  };

  // Función para reiniciar todos los contadores
  const resetAll = () => {
    Alert.alert(
      'Reiniciar marcador',
      '¿Estás seguro de que quieres reiniciar todo el marcador? Se perderán los goles y el tiempo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            setMainRunning(false);
            setMainSeconds(0);
            setIsPaused(false);
            setExtraRunning(false);
            setExtraSeconds(0);
            setExtraMinutesValue(0);
            setLocalScore(0);
            setVisitorScore(0);
            sendBLECommand('R');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>
        {isPaused ? 'PAUSA' : formatTime(mainSeconds)}
      </Text>

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
            disabled={mainRunning}
          >
            <Text style={{ textAlign: 'center', fontWeight: 600, fontSize: 20 }}>
              {mainRunning ? 'Tiempo iniciado' : 'Empezar tiempo'}
            </Text>
          </Pressable>

          <View style={styles.extraTimerActions}>
            <Pressable
              style={styles.addremoveTimeButtons}
              onPress={() => !extraRunning && setExtraMinutesValue(prev => Math.max(prev - 1, 0))}
              disabled={extraRunning}
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
              disabled={extraRunning}
            >
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>+</Text>
            </Pressable>
          </View>

          <View style={styles.extraTimerActions}>
            <Pressable
              style={styles.confirmExtraTimeButton}
              onPress={handleAddExtraTime}
              disabled={extraRunning}
            >
              <Text style={{ textAlign: 'center', fontWeight: 700 }}>Añadir tiempo extra</Text>
            </Pressable>

            <Pressable style={styles.undoGoalButtons} onPress={resetAll}>
              <Image style={styles.undoGoalIcon} source={resetIcon} />
            </Pressable>

            <Pressable
              style={[
                styles.pauseTimerButton,
                isPaused && styles.pauseTimerButtonActive
              ]}
              onPress={handlePauseToggle}
              disabled={!mainRunning && !isPaused}
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

  pauseTimerButtonActive: {
    backgroundColor: '#4CAF50',
  },
});

export default Index;