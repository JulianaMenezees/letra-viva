// LevelsCacaPalavras.js
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ImageBackground,
  ScrollView,
  useWindowDimensions,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import useTTS from "../utils/useTTS";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOP_IMAGE = "/mnt/data/aae93119-ceb0-44cd-a0b1-1cfeb2ee94e3.png";
const CONGRATS_IMAGE = require("../assets/images/jogos/cacaPalavras/concluiu.png");

// default inicial (pode ser sobrescrito via route.params.totalLevels)
const DEFAULT_TOTAL_LEVELS = 4;
const initialUnlocked = 1;

export default function LevelsJogoMemoria({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { speak } = useTTS();
  const timerRef = useRef(null);

  // parâmetros opcionais para tornar a tela genérica:
  // gameRouteName: nome da rota para navegar ao abrir um nível (ex: 'JogoMemoria' ou 'CacaPalavras')
  // progressKey: chave do AsyncStorage (ex: 'caca_progress_global' ou 'memoria_progress_global')
  // totalLevels: número de níveis deste jogo
  const GAME_ROUTE = route?.params?.gameRouteName || "JogoMemoria";
  const PROGRESS_KEY = route?.params?.progressKey || "caca_progress_global";
  const TOTAL_LEVELS = Number(route?.params?.totalLevels) || DEFAULT_TOTAL_LEVELS;

  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedUpTo, setUnlockedUpTo] = useState(initialUnlocked);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);

  // carrega progresso
  useEffect(() => {
    loadProgress();
    const unsub = navigation.addListener("focus", loadProgress);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PROGRESS_KEY, TOTAL_LEVELS]);

  // versão robusta de loadProgress (trata strings, JSON inválido, duplicates)
  async function loadProgress() {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      console.log("[loadProgress] raw from AsyncStorage:", PROGRESS_KEY, raw);

      let data;
      try {
        data = raw ? JSON.parse(raw) : { completed: [] };
      } catch (err) {
        console.warn("[loadProgress] JSON.parse falhou, resetando dados", err);
        data = { completed: [] };
      }

      // garante que completed seja um array de números
      const completedRaw = Array.isArray(data.completed) ? data.completed : [];
      const completed = completedRaw
        .map((v) => {
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        })
        .filter((n) => n !== null)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b);

      console.log("[loadProgress] parsed completed:", completed);

      setCompletedLevels(completed);

      const maxCompleted = completed.length ? Math.max(...completed) : 0;
      setUnlockedUpTo(Math.max(initialUnlocked, maxCompleted + 1));

      // se concluiu todos (considerando TOTAL_LEVELS) -> modal
      if (completed.length >= TOTAL_LEVELS && TOTAL_LEVELS > 0) {
        setShowCongrats(true);
        speak?.("Parabéns! Você concluiu todos os níveis deste jogo!");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setShowCongrats(false);
        }, 4000);
      }
    } catch (err) {
      console.error("Erro ao carregar progresso", err);
    } finally {
      setLoading(false);
    }
  }

  // função para resetar (útil para debug / testes)
  async function resetProgressConfirm() {
    try {
      await AsyncStorage.removeItem(PROGRESS_KEY);
      setCompletedLevels([]);
      setUnlockedUpTo(initialUnlocked);
      setShowCongrats(false);
      console.log("[resetProgressConfirm] progresso removido para key:", PROGRESS_KEY);
      Alert.alert("Progresso", "Progresso resetado para testes.");
    } catch (err) {
      console.error("Erro ao resetar progresso", err);
      Alert.alert("Erro", "Não foi possível resetar o progresso.");
    }
  }

  // array de níveis (1..TOTAL_LEVELS)
  const levels = useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1), [TOTAL_LEVELS]);

  function renderItem({ item: level }) {
    const completed = completedLevels.includes(level);
    const unlocked = level <= unlockedUpTo;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (!unlocked) return;
          // NÃO passar funções aqui — somente dados serializáveis
          navigation.navigate(GAME_ROUTE, {
            level,
            progressKey: PROGRESS_KEY,
            // opcional: você pode passar titleImage ou outros dados primitivos
          });
        }}
        style={[styles.levelButton, !unlocked && styles.levelButtonLocked, completed && styles.levelButtonCompleted]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.levelCircle, completed && styles.levelCircleCompleted, !unlocked && styles.levelCircleLocked]}>
            <Text style={[styles.levelCircleText, completed && styles.levelCircleTextCompleted]}>{level}</Text>
          </View>

          <Text style={[styles.levelText, completed && styles.levelTextCompleted, !unlocked && styles.levelTextLocked]}>
            Nível {level}
          </Text>
        </View>

        <View style={styles.rightBox}>
          {!unlocked ? <Text style={styles.lockText}>🔒</Text> : completed ? <Text style={styles.okText}>✔ Concluído</Text> : <Text style={styles.playText}>▶ Jogar</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ImageBackground source={{ uri: TOP_IMAGE }} style={styles.topImage} imageStyle={{ opacity: 0.12 }}>
          <View style={styles.topBar}>
            <Image source={require("../assets/images/jogos/cacaPalavras/titulo.png")} style={styles.titleImage} resizeMode="contain" />
          </View>
        </ImageBackground>

        <View style={styles.container}>
          <View style={styles.wordsCard}>
            <Text style={styles.cardHeader}>Níveis</Text>

            <View style={styles.board}>
              <Text style={styles.boardTitle}>Escolha um nível</Text>

              <FlatList data={levels} renderItem={renderItem} keyExtractor={(i) => i.toString()} scrollEnabled={false} />
            </View>

            <View style={{ marginTop: 12, alignItems: "center" }}>
              {/* <TouchableOpacity style={styles.resetButton} onPress={resetProgressConfirm}>
                <Text style={styles.resetText}>Resetar progresso (teste)</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* congratulations modal */}
      <Modal visible={showCongrats} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image source={CONGRATS_IMAGE} style={styles.modalImage} resizeMode="contain" />
            <Text style={styles.modalTitle}>Parabéns!</Text>
            <Text style={styles.modalSubtitle}>Você concluiu todos os níveis!</Text>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.9}
              onPress={() => {
                setShowCongrats(false);
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- estilos ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e5ddc8" },
  scroll: { paddingBottom: 40 },
  topImage: {
    width: "100%",
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#cdebb0",
  },
  titleImage: { height: 230, aspectRatio: 200, alignSelf: "center", marginTop: 20 },
  topBar: { width: "92%", alignItems: "center" },

  container: { alignItems: "center", paddingHorizontal: 16, paddingTop: 10 },

  wordsCard: {
    width: "105%",
    backgroundColor: "#fff7ee",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 60,
  },

  cardHeader: { fontSize: 16, color: "#6b6f76", fontWeight: "700", marginBottom: 8, textAlign: "center" },

  boardTitle: { fontSize: 18, fontWeight: "800", color: "#9a5fcc", marginBottom: 12, textAlign: "center" },

  levelButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ec707a",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  levelButtonLocked: { backgroundColor: "#e6e6e6", opacity: 0.9 },

  levelButtonCompleted: { backgroundColor: "#9a5fcc" },

  levelCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center", marginRight: 12 },

  levelCircleCompleted: { backgroundColor: "#fff" },

  levelCircleLocked: { backgroundColor: "#ddd" },

  levelCircleText: { color: "#fff", fontWeight: "900", fontSize: 18 },

  levelCircleTextCompleted: { color: "#9a5fcc" },

  levelText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  levelTextCompleted: { color: "#fff" },

  levelTextLocked: { color: "#444" },

  rightBox: { minWidth: 100, alignItems: "flex-end" },

  lockText: { color: "#333", fontSize: 16 },

  okText: { color: "#cdebb0", fontSize: 14, fontWeight: "700" },

  playText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  resetButton: { backgroundColor: "#ff6b6b", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },

  resetText: { color: "#fff", fontWeight: "700" },

  /* modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },

  modalCard: { width: "92%", maxWidth: 520, backgroundColor: "#fffefc", borderRadius: 18, paddingVertical: 18, paddingHorizontal: 18, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },

  modalImage: { width: 220, height: 220, marginBottom: 8 },

  modalTitle: { fontSize: 24, fontWeight: "800", color: "#3f3f3f", marginTop: 6 },

  modalSubtitle: { fontSize: 15, color: "#6b6f76", marginTop: 8, textAlign: "center" },

  modalButton: { marginTop: 14, backgroundColor: "#EC707A", paddingVertical: 10, paddingHorizontal: 22, borderRadius: 14 },

  modalButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  lockText: {
    color: "#333",
    fontSize: 14,   
  },

  okText: {
    color: "#add778",
    fontSize: 17,  
    fontWeight: "700"
  },

  playText: {
    color: "#fff",
    fontSize: 17,   
    fontWeight: "700"
  },

});
