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

export default function LevelsDomino({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { speak } = useTTS();
  const timerRef = useRef(null);

  // parâmetros opcionais para tornar a tela genérica:
  // gameRouteName: nome da rota para navegar ao abrir um nível (ex: 'JogoMemoria' ou 'CacaPalavras')
  // progressKey: chave do AsyncStorage (ex: 'caca_progress_global' ou 'memoria_progress_global')
  // totalLevels: número de níveis deste jogo
  const GAME_ROUTE = route?.params?.gameRouteName || "DominoScreen";
  const PROGRESS_KEY = route?.params?.progressKey || "domino_progress_global";
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
          {!unlocked ? <Text style={styles.lockText}></Text> : completed ? <Text style={styles.okText}>✔</Text> : <Text style={styles.playText}>▶</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  const DECOR_TOP_RIGHT = require("../assets/images/jogos/niveis/estrelas.png");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* top image (se quiser ativar) */}
        {/* <ImageBackground source={{ uri: TOP_IMAGE }} style={styles.topImage} imageStyle={{ opacity: 0.12 }}>
          <View style={styles.topBar}>
            <Image source={require("../assets/images/jogos/cacaPalavras/titulo.png")} style={styles.titleImage} resizeMode="contain" />
          </View>
        </ImageBackground> */}

        <View style={styles.container}>
          <View style={styles.wordsCard}>

            {/* ESTRELA AGORA NA ESQUERDA */}
            <Image
              source={DECOR_TOP_RIGHT}
              style={[styles.decorCornerInside, styles.topLeftInside]}
              pointerEvents="none"
              resizeMode="contain"
            />

            {/* ÁUDIO AGORA NA DIREITA */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                speak?.("Toque em um nível para começar");
              }}
              style={styles.audioButtonRight}
              accessibilityLabel="Botão de áudio"
            >
              <Text style={styles.audioIcon}>🔊</Text>
            </TouchableOpacity>

            {/* conteúdo real do cartão */}
            <View style={styles.board}>
              <FlatList
                data={levels}
                renderItem={renderItem}
                keyExtractor={(i) => i.toString()}
                scrollEnabled={false}
                contentContainerStyle={{
                  paddingTop: 70,
                }}
              />
            </View>

            <View style={{ marginTop: 20, alignItems: "center" }}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetProgressConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.resetButtonText}>↻</Text>
              </TouchableOpacity>
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
  safe: { flex: 1, backgroundColor: "#add778" },
  scroll: { paddingBottom: 40 },
  topImage: {
    width: "100%",
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#add778",
  },
  titleImage: { height: 230, aspectRatio: 200, alignSelf: "center", marginTop: 20 },
  topBar: { width: "92%", alignItems: "center" },

  container: { alignItems: "center", paddingHorizontal: 16, paddingTop: 10 },

  wordsCard: {
    position: "relative",   // <- importante para imagens absolutas internas
    width: "100%",
    backgroundColor: "#fff7ee",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 200,
    minHeight: 200,   // << AQUI O QUE VOCÊ QUER
    overflow: "hidden", // corta partes das imagens que saiam do cartão (mude para "visible" se preferir)
  },

  cardHeader: { fontSize: 30, color: "#6b6f76", fontWeight: "700", marginBottom: 8, textAlign: "center" },

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

  /* decor internas */
  decorCornerInside: {
    position: "absolute",
    width: 100,          // ajuste para caber bem dentro do cartão
    height: 100,
    opacity: 1,
    zIndex: 2,
  },

  topLeftInside: {
    top: 8,
    left: 20,
    transform: [{ rotate: "0deg" }],
  },
  topRightInside: {
    top: 8,
    right: 8,
    transform: [{ rotate: "0deg" }],
  },
  bottomLeftInside: {
    bottom: 8,
    left: 8,
    transform: [{ rotate: "-10deg" }],
  },
  bottomRightInside: {
    bottom: 8,
    right: 8,
    transform: [{ rotate: "10deg" }],
  },

  lockText: {
    color: "#333",
    fontSize: 20,
  },

  okText: {
    color: "#add778",
    fontSize: 20,
    fontWeight: "700"
  },

  playText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700"
  },

  audioButtonRight: {
    position: "absolute",
    top: 8,
    right: 8,      // <-- agora do lado direito
    width: 70,
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 6,
  },
  audioIcon: {
    fontSize: 30,
    textAlign: "center",
  },
    resetButton: {
    backgroundColor: "#EC707A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
  },

  resetButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

});
