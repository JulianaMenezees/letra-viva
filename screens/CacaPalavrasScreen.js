import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  useWindowDimensions,
  Modal,
} from "react-native";
import useTTS from "../utils/useTTS";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MIN_GRID = 6;
const MAX_GRID = 45;
const MIN_CELL_SIZE = 50; // tamanho mínimo em px por célula (ajusta se quiser)

// --- níveis com palavras por nível ---
const LEVELS = {
  1: ["CASA", "BOLA", "PATO", "GATO"],
  2: ["MESA", "SAPO", "RATO", "URSO", "SOFA", "CHAVE", "BOLO", "SOL"],
  3: [
    "LUA",
    "UVA",
    "MEL",
    "CARRO",
    "LIVRO",
    "CARNE",
    "LOBO",
    "LAPIS",
    "PIPA",
    "GALO",
    "FACA",
    "PORTA",
    "FLOR",
    "CAMA",
    "MALA",
    "COPO",
  ],
};

const WORD_IMAGES = {
  CASA: require("../assets/images/jogos/cacaPalavras/casa.png"),
  BOLA: require("../assets/images/jogos/cacaPalavras/bola.png"),
  PATO: require("../assets/images/jogos/cacaPalavras/pato.png"),
  GATO: require("../assets/images/jogos/cacaPalavras/gato.png"),
  MESA: require("../assets/images/jogos/cacaPalavras/mesa.png"),

  SAPO: require("../assets/images/jogos/cacaPalavras/sapo.png"),
  RATO: require("../assets/images/jogos/cacaPalavras/rato.png"),
  URSO: require("../assets/images/jogos/cacaPalavras/urso.png"),
  SOFA: require("../assets/images/jogos/cacaPalavras/sofa.png"),
  CHAVE: require("../assets/images/jogos/cacaPalavras/chave.png"),
  SOL: require("../assets/images/jogos/cacaPalavras/sol.png"),
  BOLO: require("../assets/images/jogos/cacaPalavras/bolo.png"),

  LUA: require("../assets/images/jogos/cacaPalavras/lua.png"),
  UVA: require("../assets/images/jogos/cacaPalavras/uva.png"),
  MEL: require("../assets/images/jogos/cacaPalavras/mel.png"),
  CARRO: require("../assets/images/jogos/cacaPalavras/carro.png"),
  LIVRO: require("../assets/images/jogos/cacaPalavras/livro.png"),
  CARNE: require("../assets/images/jogos/cacaPalavras/carne.png"),
  LOBO: require("../assets/images/jogos/cacaPalavras/lobo.png"),
  LAPIS: require("../assets/images/jogos/cacaPalavras/lapis.png"),
  PIPA: require("../assets/images/jogos/cacaPalavras/pipa.png"),
  GALO: require("../assets/images/jogos/cacaPalavras/galo.png"),
  FACA: require("../assets/images/jogos/cacaPalavras/faca.png"),
  PORTA: require("../assets/images/jogos/cacaPalavras/porta.png"),
  FLOR: require("../assets/images/jogos/cacaPalavras/flor.png"),
  CAMA: require("../assets/images/jogos/cacaPalavras/cama.png"),
  MALA: require("../assets/images/jogos/cacaPalavras/mala.png"),
  COPO: require("../assets/images/jogos/cacaPalavras/copo.png"),
};

function onlyLetters(str) {
  return Array.from(str)
    .filter((ch) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(ch))
    .join("");
}

export default function CacaPalavrasScreen() {
  const { speak } = useTTS();
  const [foundWords, setFoundWords] = useState([]);
  const [currentSelection, setCurrentSelection] = useState("");
  const [selectionCoords, setSelectionCoords] = useState([]);
  const [foundCells, setFoundCells] = useState([]);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute();
  const timerRef = useRef(null);

  // chave de progresso específica (vinda do Levels ou fallback global)
  const PROGRESS_KEY = route?.params?.progressKey || "caca_progress_global";

  const levelNum = Number(route?.params?.level) || 1;
  const [showCongrats, setShowCongrats] = useState(false);

  const DISPLAY_WORDS = LEVELS[levelNum] ?? LEVELS[1];

  const SEARCH_WORDS = useMemo(
    () => DISPLAY_WORDS.map((w) => onlyLetters(w).toUpperCase()),
    [DISPLAY_WORDS]
  );

  // calcula GRID_SIZE com heurística que considera: maior palavra, total de letras e número de palavras
  const gridSize = useMemo(() => {
    if (!SEARCH_WORDS || SEARCH_WORDS.length === 0) return MIN_GRID;

    const longest = Math.max(...SEARCH_WORDS.map((w) => w.length));
    const totalLetters = SEARCH_WORDS.reduce((s, w) => s + w.length, 0);
    const numWords = SEARCH_WORDS.length;

    // heurísticas:
    const approxSide = Math.ceil(Math.sqrt(totalLetters * 1.2)); // área proporcional
    const wordsSide = Math.max(Math.ceil(numWords * 0.9), longest); // mais palavras -> maior largura

    let side = Math.max(MIN_GRID, longest, approxSide, wordsSide);
    if (side > MAX_GRID) side = MAX_GRID;
    return side;
  }, [SEARCH_WORDS]);

  // gera grid quando SEARCH_WORDS ou gridSize mudarem
  const grid = useMemo(() => generateGrid(SEARCH_WORDS, gridSize), [SEARCH_WORDS, gridSize]);

  useEffect(() => {
    setFoundWords([]);
    setFoundCells([]);
    setCurrentSelection("");
    setSelectionCoords([]);
  }, [levelNum]);

  useEffect(() => {
    // anúncio inicial por voz (útil para jogadores que não leem)
    speak(`Vamos jogar! As palavras do nível são: ${SEARCH_WORDS.join(", ")}`);
  }, [SEARCH_WORDS, speak]);

  useEffect(() => {
    if (foundWords.length > 0 && foundWords.length === SEARCH_WORDS.length) {
      setShowCongrats(true);
      speak(`Parabéns! Você encontrou todas as palavras! Excelente trabalho!`);
      markLevelComplete(levelNum).then(() => {
        timerRef.current = setTimeout(() => {
          setShowCongrats(false);
          navigation.navigate("LevelsCacaPalavras");
        }, 3200);
      });
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords, SEARCH_WORDS.length]);

  // cálculo tamanho da célula — garantimos MIN_CELL_SIZE; se ficar maior, usamos o espaço
  const horizontalPadding = 32;
  const marginCell = 6;
  const available = width - horizontalPadding;
  const computedCell = Math.floor((available - marginCell * (gridSize - 1)) / gridSize);
  const cellSize = Math.max(MIN_CELL_SIZE, computedCell);
  const letterFontSize = Math.max(14, Math.floor(cellSize * 0.45));
  const isOverflowing = computedCell < MIN_CELL_SIZE;

  async function markLevelComplete(levelToSave) {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      const data = raw ? JSON.parse(raw) : { completed: [] };
      const completed = Array.isArray(data.completed) ? data.completed : [];
      if (!completed.includes(levelToSave)) {
        const newCompleted = [...completed, levelToSave].sort((a, b) => a - b);
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: newCompleted }));
      }
    } catch (err) {
      console.error("Erro ao salvar progresso", err);
    }
  }

  // seleção horizontal
  const handlePress = (r, c) => {
    const coord = `${r}-${c}`;
    const letter = grid[r][c];
    if (foundCells.includes(coord)) return;
    if (selectionCoords.length === 0) {
      setSelectionCoords([coord]);
      setCurrentSelection(letter);
      checkSelection([coord], letter);
      return;
    }
    const lastCoord = selectionCoords[selectionCoords.length - 1];
    const [lr, lc] = lastCoord.split("-").map(Number);
    if (r === lr && c === lc + 1) {
      const newCoords = [...selectionCoords, coord];
      const newSelected = newCoords
        .map((s) => {
          const [rr, cc] = s.split("-").map(Number);
          return grid[rr][cc];
        })
        .join("");
      setSelectionCoords(newCoords);
      setCurrentSelection(newSelected);
      checkSelection(newCoords, newSelected);
      return;
    }
    const idxInSel = selectionCoords.indexOf(coord);
    if (idxInSel !== -1) {
      const trimmed = selectionCoords.slice(0, idxInSel + 1);
      const newSelected = trimmed
        .map((s) => {
          const [rr, cc] = s.split("-").map(Number);
          return grid[rr][cc];
        })
        .join("");
      setSelectionCoords(trimmed);
      setCurrentSelection(newSelected);
      checkSelection(trimmed, newSelected);
      return;
    }
    setSelectionCoords([coord]);
    setCurrentSelection(letter);
    checkSelection([coord], letter);
  };

  function checkSelection(coords, selectedString) {
    const idx = SEARCH_WORDS.indexOf(selectedString);
    if (idx === -1) return;
    const label = DISPLAY_WORDS[idx];
    if (foundWords.includes(label)) {
      setSelectionCoords([]);
      setCurrentSelection("");
      return;
    }
    setFoundWords((prev) => [...prev, label]);
    setFoundCells((prev) => {
      const set = new Set(prev);
      coords.forEach((cstr) => set.add(cstr));
      return Array.from(set);
    });
    speak(`Parabéns! Você encontrou a palavra ${selectedString}`);
    setSelectionCoords([]);
    setCurrentSelection("");
  }

  // calcula tamanho do ícone central responsivo
  const headerIconSize = Math.min(140, Math.floor(width * 0.28));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* HEADER limpo, sem imagem de fundo nem título escrito */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.starsRow}>
              {Array.from({ length: 3 }).map((_, i) => {
                const filled = i < Math.min(3, levelNum);
                return (
                  <Text
                    key={i}
                    style={[styles.starEmoji, filled ? styles.starEmojiFilled : styles.starEmojiEmpty]}
                    accessible
                    accessibilityLabel={filled ? `Estrela ${i + 1} preenchida` : `Estrela ${i + 1} vazia`}
                  >
                    {filled ? "★" : "☆"}
                  </Text>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => speak(`Nível ${levelNum}`)}
              accessibilityLabel={`Falar nível ${levelNum}`}
              style={styles.heroButton}
            >
              <View
                style={[
                  styles.heroCircle,
                  {
                    width: headerIconSize + 20,
                    height: headerIconSize + 20,
                    borderRadius: (headerIconSize + 20) / 2,
                    transform: [{ translateX: -10 }],
                  },
                ]}
              >

                {/* OPÇÃO 1: centralização precisa usando position:absolute */}
                <Text
                  style={[
                    styles.heroNumber,
                    {
                      fontSize: Math.round(headerIconSize * 0.55),
                      position: "absolute",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      // transform: [{ translateX: -6 }],
                    },
                  ]}
                >
                  {levelNum}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.speakerButton}
              onPress={() => speak(`Vamos jogar! Nível ${levelNum}`)}
              activeOpacity={0.75}
              accessible
              accessibilityLabel="Ouvir instrução em áudio"
            >
              <Text style={styles.speakerEmoji}>🔊</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showCongrats} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Image
                source={require("../assets/images/jogos/cacaPalavras/check.png")}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Parabéns</Text>
              <Text style={styles.modalSubtitle}>Você concluiu!</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.container}>
          <View style={styles.wordsCard}>
            <Text style={styles.cardHeader}>Palavras escondidas (Nível {levelNum})</Text>

            <View style={styles.wordsContainer}>
              {DISPLAY_WORDS.map((lbl, idx) => {
                const text = lbl;
                const found = foundWords.includes(lbl);
                return (
                  <View key={`${lbl}-${idx}`} style={[styles.wordBadge, found && styles.wordBadgeFound]}>
                    {WORD_IMAGES[text] ? (
                      <Image source={WORD_IMAGES[text]} style={styles.wordIcon} resizeMode="contain" />
                    ) : null}
                    <Text style={[styles.wordText, styles.wordLabelFont, found && styles.wordTextFound]}>{text}</Text>
                    {found && <Image source={require("../assets/images/jogos/cacaPalavras/check_.png")} style={styles.checkIcon} />}
                  </View>
                );
              })}
            </View>

            {/* Scroll horizontal para quando for necessário rolar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={[styles.grid, { marginTop: 12 }]}>
                {grid.map((row, r) => (
                  <View key={r} style={styles.row}>
                    {row.map((letter, c) => {
                      const coord = `${r}-${c}`;
                      const isFoundCell = foundCells.includes(coord);
                      const isSelectedCell = selectionCoords.includes(coord);

                      return (
                        <TouchableOpacity
                          key={c}
                          activeOpacity={0.8}
                          disabled={isFoundCell}
                          onPress={() => handlePress(r, c)}
                          style={[
                            styles.cell,
                            {
                              width: cellSize,
                              height: cellSize,
                              marginRight: c === row.length - 1 ? 0 : marginCell,
                              marginBottom: marginCell,
                              backgroundColor: isFoundCell ? "#add778" : isSelectedCell ? "#fddc5a" : "#EC707A",
                            },
                          ]}
                        >
                          <Text style={[styles.letter, { fontSize: letterFontSize }]}>{letter}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Grid: {gridSize}×{gridSize}</Text>
            {isOverflowing ? (
              <Text style={{ marginTop: 2, fontSize: 12, color: "#666" }}>Role horizontalmente para ver todo o grid</Text>
            ) : null}
            <Text style={{ marginTop: 2, fontSize: 12, color: "#666" }}>Seleção: {currentSelection || "—"}</Text> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* generateGrid agora recebe lista de palavras e gridSize */
function generateGrid(words = [], gridSize = 8) {
  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  function canPlaceHorizontally(row, col, word) {
    if (col < 0 || col + word.length > gridSize) return false;
    // evita colagem direta: exige célula vazia antes e depois quando possível
    if (col - 1 >= 0 && grid[row][col - 1] !== null) return false;
    if (col + word.length < gridSize && grid[row][col + word.length] !== null) return false;
    for (let i = 0; i < word.length; i++) {
      const existing = grid[row][col + i];
      if (existing !== null && existing !== word[i]) return false;
    }
    return true;
  }

  function placeHorizontally(row, col, word) {
    for (let i = 0; i < word.length; i++) {
      grid[row][col + i] = word[i];
    }
  }

  const wordsToPlace = [...words];
  for (let i = wordsToPlace.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordsToPlace[i], wordsToPlace[j]] = [wordsToPlace[j], wordsToPlace[i]];
  }

  wordsToPlace.forEach((word) => {
    let placed = false;
    const maxAttempts = 800;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const row = Math.floor(Math.random() * gridSize);
      const maxCol = gridSize - word.length;
      if (maxCol < 0) {
        console.warn(`Palavra "${word}" maior que gridSize (${gridSize}), pulando.`);
        break;
      }
      const col = Math.floor(Math.random() * (maxCol + 1));

      if (canPlaceHorizontally(row, col, word)) {
        placeHorizontally(row, col, word);
        placed = true;
      }
    }

    if (!placed) {
      outer: for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col <= gridSize - word.length; col++) {
          if (canPlaceHorizontally(row, col, word)) {
            placeHorizontally(row, col, word);
            placed = true;
            break outer;
          }
        }
      }
    }

    if (!placed) {
      console.warn(`Não foi possível posicionar a palavra "${word}" no grid de tamanho ${gridSize}.`);
    }
  });

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return grid;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingBottom: 40 },

  /* HEADER sem imagem e sem fundo verde — cartão limpo */
  headerContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 6,
    backgroundColor: "#add778",
  },
  headerCard: {
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffefc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    // sombra leve
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  starEmoji: {
    fontSize: 28,
    marginRight: 6,
    lineHeight: 32,
  },
  starEmojiFilled: {
    color: "#FFD24D",
  },
  starEmojiEmpty: {
    color: "#C4C4C4",
  },

  heroButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6F7", // suave rosa
    borderWidth: 1,
    borderColor: "rgba(236,112,122,0.14)",
    position: "relative",
  },
  heroNumber: {
    color: "#ec707a",
    fontWeight: "900",
    textAlign: "center",
  },

  levelBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    backgroundColor: "#ec707a",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#6b6f76",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  levelBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  speakerButton: {
    width: 52,
    height: 52,
    borderRadius: 52,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  speakerEmoji: {
    fontSize: 22,
  },

  topBar: { width: "92%", alignItems: "center" },
  container: { alignItems: "center", paddingHorizontal: 16, paddingTop: 10 },
  wordsCard: {
    width: "105%",
    backgroundColor: "#fff7ee",
    borderRadius: 16,
    padding: 25,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: { fontSize: 16, color: "#6b6f76", fontWeight: "700", marginBottom: 8 },
  wordsContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  wordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 86,
    justifyContent: "flex-start",
  },
  wordBadgeFound: {
    backgroundColor: "rgba(173, 215, 120, 0.4)",
  },
  wordIcon: { width: 50, height: 50, marginRight: 10 },
  wordText: { fontSize: 15, color: "#4e4e4e", fontWeight: "700" },
  wordLabelFont: { fontSize: 15, fontWeight: "700" },
  wordTextFound: { color: "#6A9D3F", textDecorationLine: "line-through" },
  grid: { marginTop: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" },
  cell: { borderRadius: 12, justifyContent: "center", alignItems: "center" },
  letter: { color: "#fff", fontWeight: "800" },
  checkIcon: {
    width: 22,
    height: 22,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "92%",
    maxWidth: 520,
    backgroundColor: "#fffefc",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalImage: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3f3f3f",
    marginTop: 6,
  },
  // modalSubtitle: {
  //   fontSize: 15,
  //   color: "#6b6f76",
  //   marginTop: 8,
  //   textAlign: "center",
  // },
  modalButton: {
    marginTop: 14,
    backgroundColor: "#EC707A",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
