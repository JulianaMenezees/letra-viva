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

// default inicial (se não passar route.params.totalLevels)
const DEFAULT_TOTAL_LEVELS = 3;
const initialUnlocked = 1;

// quantas fases por nível (deve bater com MultiGame.js)
const PHASES_PER_LEVEL = 4;

// mapa de categoria por nível (nível 1 -> matematica, 2 -> portugues, 3 -> tecnologia)
const CATEGORIES_BY_LEVEL = ["matematica", "portugues", "tecnologia"];

export default function LevelsCacaPalavras({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { speak } = useTTS();
  const timerRef = useRef(null);

  // parâmetros opcionais para reutilizar a tela em outros jogos
  const GAME_ROUTE = route?.params?.gameRouteName || "Tabuleiro"; // ex: 'Tabuleiro'
  const PROGRESS_KEY = route?.params?.progressKey || "caca_progress_global";
  const TOTAL_LEVELS = Number(route?.params?.totalLevels) || DEFAULT_TOTAL_LEVELS;

  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedUpTo, setUnlockedUpTo] = useState(initialUnlocked);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);

  // carrega progresso ao montar e ao voltar ao foco
  useEffect(() => {
    loadProgress();
    const unsub = navigation.addListener("focus", loadProgress);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PROGRESS_KEY, TOTAL_LEVELS]);

  // Detecta retorno do jogo com dados de fase concluída
  useEffect(() => {
    const lvl = route?.params?.completedLevel;
    const ph = route?.params?.completedPhase;
    if (lvl) {
      console.log("[Levels] received completedLevel from route:", lvl, ph);
      // atualiza o progresso (recarrega do storage)
      loadProgress();

      // opcional: mostrar alerta curto
      if (ph) {
        Alert.alert("Fase concluída", `Nível ${lvl} — Fase ${ph} concluída!`);
      } else {
        Alert.alert("Nível concluído", `Nível ${lvl} concluído!`);
      }

      // limpa params pra não disparar de novo
      try {
        navigation.setParams({ completedLevel: undefined, completedPhase: undefined });
      } catch (e) {
        // ignora se não funcionar em algumas versões
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.completedLevel, route?.params?.completedPhase]);

  // versão robusta de loadProgress (suporta "N", "N:P", "L1P2" e normaliza)
  async function loadProgress() {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      console.log("[Levels] loadProgress raw:", PROGRESS_KEY, raw);

      let data;
      try {
        data = raw ? JSON.parse(raw) : { completed: [] };
      } catch (err) {
        console.warn("[Levels] JSON.parse falhou, resetando dados", err);
        data = { completed: [] };
      }

      const completedRaw = Array.isArray(data.completed) ? data.completed : [];

      // normaliza tudo para pares "nivel:fase" (strings)
      const normalizedPairs = completedRaw.flatMap((v) => {
        if (v == null) return [];
        const s = String(v).trim();
        // formato legacy: só número => marca todas as fases desse nível
        if (/^\d+$/.test(s)) {
          const lvl = Number(s);
          return Array.from({ length: PHASES_PER_LEVEL }, (_, i) => `${lvl}:${i + 1}`);
        }
        // formato comum: "N:P" ou "N-P" ou "N P"
        const m = s.match(/(\d+)[^\d]+(\d+)/);
        if (m) return `${Number(m[1])}:${Number(m[2])}`;
        // formato L1P2
        const m2 = s.match(/L(\d+).*P(\d+)/i);
        if (m2) return `${Number(m2[1])}:${Number(m2[2])}`;
        // ignorar outros formatos
        return [];
      }).filter(Boolean);

      // dedupe
      const dedupedPairs = Array.from(new Set(normalizedPairs));

      // construir mapa nível -> set de fases concluídas
      const levelToPhases = {};
      dedupedPairs.forEach((p) => {
        const [ls, ps] = p.split(":");
        const lvl = Number(ls);
        const ph = Number(ps);
        if (!Number.isFinite(lvl) || !Number.isFinite(ph)) return;
        if (!levelToPhases[lvl]) levelToPhases[lvl] = new Set();
        levelToPhases[lvl].add(ph);
      });

      console.log("[Levels] normalized pairs:", dedupedPairs);
      console.log(
        "[Levels] completed per level:",
        Object.fromEntries(
          Object.entries(levelToPhases).map(([k, set]) => [k, Array.from(set).sort((a, b) => a - b)])
        )
      );

      // === Opção B2: marca nível como "completado" quando existe pelo menos 1 fase concluída
      const levelsWithAnyPhase = Object.keys(levelToPhases)
        .map((k) => Number(k))
        .filter((lvl) => levelToPhases[lvl].size > 0)
        .sort((a, b) => a - b);

      console.log("[Levels] levelsWithAnyPhase:", levelsWithAnyPhase);

      // atualiza estado
      setCompletedLevels(levelsWithAnyPhase);
      const maxCompleted = levelsWithAnyPhase.length ? Math.max(...levelsWithAnyPhase) : 0;
      setUnlockedUpTo(Math.max(initialUnlocked, maxCompleted + 1));

      // se concluiu todos -> modal
      if (levelsWithAnyPhase.length >= TOTAL_LEVELS && TOTAL_LEVELS > 0) {
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

  // salva nível completo (pode ser usado por debug; o Jogo salva seu próprio progresso)
  async function markLevelComplete(level) {
    try {
      const lvl = Number(level);
      if (!Number.isFinite(lvl)) {
        console.warn("[Levels] markLevelComplete level inválido:", level);
        return;
      }

      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      let data;
      try {
        data = raw ? JSON.parse(raw) : { completed: [] };
      } catch (err) {
        data = { completed: [] };
      }

      const completedRaw = Array.isArray(data.completed) ? data.completed : [];
      const completedNums = completedRaw.map((v) => Number(v)).filter((n) => Number.isFinite(n));

      if (!completedNums.includes(lvl)) {
        const newCompleted = [...completedNums, lvl].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: newCompleted }));
        setCompletedLevels(newCompleted);
        setUnlockedUpTo(Math.max(initialUnlocked, Math.max(...newCompleted) + 1));
        console.log("[Levels] markLevelComplete saved:", newCompleted);
      } else {
        console.log("[Levels] nível já marcado:", lvl);
      }
    } catch (err) {
      console.error("Erro ao marcar nível", err);
    }
  }

  // array de níveis (1..TOTAL_LEVELS)
  const levels = useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1), [TOTAL_LEVELS]);

  function renderItem({ item: level }) {
    const completed = completedLevels.includes(level);
    const unlocked = level <= unlockedUpTo;

    // categoria a enviar para o jogo (mapa por nível)
    const category = CATEGORIES_BY_LEVEL[level - 1] || route?.params?.gameCategory || "matematica";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (!unlocked) return;
          navigation.navigate(GAME_ROUTE, {
            level,
            phase: 1, // abre a fase 1 — depois você pode mudar pra abrir modal/fase específica
            progressKey: PROGRESS_KEY,
            category, // passa categoria correta pro jogo
          });
        }}
        style={[styles.levelButton, !unlocked && styles.levelButtonLocked, completed && styles.levelButtonCompleted]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.levelCircle, completed && styles.levelCircleCompleted, !unlocked && styles.levelCircleLocked]}>
            <Text style={[styles.levelCircleText, completed && styles.levelCircleTextCompleted]}>{level}</Text>
          </View>

          <Text style={[styles.levelText, completed && styles.levelTextCompleted, !unlocked && styles.levelTextLocked]}>Nível {level}</Text>
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
            <Image source={require("../assets/images/jogos/cacaPalavras/pista_jogos.png")} style={styles.titleImage} resizeMode="contain" />
          </View>
        </ImageBackground>

        <View style={styles.container}>
          <View style={styles.wordsCard}>
            <Text style={styles.cardHeader}>Níveis</Text>

            <View style={styles.board}>
              <Text style={styles.boardTitle}>Escolha um nível</Text>

              <FlatList data={levels} renderItem={renderItem} keyExtractor={(i) => i.toString()} scrollEnabled={false} />
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

            <TouchableOpacity style={styles.modalButton} activeOpacity={0.9} onPress={() => setShowCongrats(false)}>
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
  titleImage: {
    height: 230,
    aspectRatio: 200,
    alignSelf: "center",
    marginTop: 20,
  },
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
});
