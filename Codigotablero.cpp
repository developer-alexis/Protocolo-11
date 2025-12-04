#include <MD_Parola.h>
#include <MD_MAX72XX.h>
#include <SPI.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MODULOS 4   // cada panel tiene 4 módulos

// Pines CS para cada panel (ajusta según tu cableado en la ESP32-C3 Super Mini)
#define CS_RELOJ    10
#define CS_VISIT    3
#define CS_LOCAL    4

// Pines SPI en ESP32-C3 Super Mini
#define DIN_PIN     7   // MOSI
#define CLK_PIN     6   // SCK

// Instancias independientes (SPI compartido)
MD_Parola reloj(HARDWARE_TYPE, DIN_PIN, CLK_PIN, CS_RELOJ, MODULOS);
MD_Parola visitante(HARDWARE_TYPE, DIN_PIN, CLK_PIN, CS_VISIT, MODULOS);
MD_Parola local(HARDWARE_TYPE, DIN_PIN, CLK_PIN, CS_LOCAL, MODULOS);

// -------- VARIABLES --------
int golesLocal = 0;
int golesVisit = 0;
unsigned long inicio = 0;
unsigned long acumulado = 0;
bool corriendo = false;
bool tiempoExtra = false;
int minutos = 0;
int segundos = 0;
int minutosExtra = 0;
bool pausa = false;

// -------- BLE --------
#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "abcd1234-5678-90ab-cdef-1234567890ab"

BLECharacteristic *pCharacteristic;

// -------- FUNCIONES --------
void actualizarTiempo() {
  if (pausa || !corriendo) return;

  unsigned long ms = (millis() - inicio) + acumulado;
  unsigned long s = ms / 1000;

  if (!tiempoExtra) {
    if (s >= 2700 && s < 2730) corriendo = false;  // 45:00
    if (s >= 5400) corriendo = false;              // 90:00
  } else {
    if (minutos >= minutosExtra && minutosExtra > 0) {
      corriendo = false;
    }
  }

  minutos = s / 60;
  segundos = s % 60;
}

void procesarComando(String cmd) {
  char c = cmd.charAt(0);

  if (c == 'S') {
    if (!corriendo && !tiempoExtra) {
      corriendo = true;
      pausa = false;
      inicio = millis();
    }
  }
  else if (c == 'R') {
    golesLocal = 0;
    golesVisit = 0;
    minutos = 0;
    segundos = 0;
    acumulado = 0;
    corriendo = false;
    tiempoExtra = false;
    minutosExtra = 0;
    pausa = false;
  }
  else if (c == 'E') {
    if (!corriendo && !tiempoExtra && minutos >= 90) {
      tiempoExtra = true;
      minutosExtra = cmd.substring(1).toInt();
      minutos = 0;
      segundos = 0;
      acumulado = 0;
      inicio = millis();
      corriendo = true;
      pausa = false;
    }
  }
  else if (c == 'P') {
    if (corriendo && !pausa) {
      pausa = true;
      acumulado += millis() - inicio;
      corriendo = false;
    }
    else if (pausa) {
      pausa = false;
      corriendo = true;
      inicio = millis();
    }
  }
  else if (corriendo && !pausa) {
    if (c == 'L') golesLocal++;
    else if (c == 'l') { if (golesLocal > 0) golesLocal--; }
    else if (c == 'V') golesVisit++;
    else if (c == 'v') { if (golesVisit > 0) golesVisit--; }
  }
}

// -------- BLE CALLBACK --------
class MyCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pChar) {
    String rxValue = String(pChar->getValue().c_str());
    if (rxValue.length() > 0) {
      procesarComando(rxValue);
    }
  }
};

// -------- SETUP --------
void setup() {
  Serial.begin(115200);

  // Inicializar BLE
  BLEDevice::init("IndustriesMakunga");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_READ
  );

  pCharacteristic->setCallbacks(new MyCallbacks());
  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  // Inicializar cada panel
  reloj.begin();
  visitante.begin();
  local.begin();

  reloj.setIntensity(5);
  visitante.setIntensity(5);
  local.setIntensity(5);

  reloj.displayClear();
  visitante.displayClear();
  local.displayClear();

  reloj.displayText("00:00", PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);
  visitante.displayText("00", PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);
  local.displayText("00", PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);

  reloj.displayReset();
  visitante.displayReset();
  local.displayReset();

  Serial.println("BLE listo, esperando conexión...");
}

// -------- LOOP --------
void loop() {
  if (corriendo && !pausa) actualizarTiempo();

  char tiempo[12];
  if (pausa) {
    sprintf(tiempo, "PAUSE");
  } else if (tiempoExtra) {
    sprintf(tiempo, "ET %02d:%02d", minutos, segundos);
  } else {
    sprintf(tiempo, "%02d:%02d", minutos, segundos);
  }
  reloj.displayText(tiempo, PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);
  reloj.displayReset();

  char vis[3];
  sprintf(vis, "%02d", golesVisit);
  visitante.displayText(vis, PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);
  visitante.displayReset();

  char loc[3];
  sprintf(loc, "%02d", golesLocal);
  local.displayText(loc, PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);
  local.displayReset();

  reloj.displayAnimate();
  visitante.displayAnimate();
  local.displayAnimate();
}