// CacaPalavrasScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
  ImageBackground,
  ScrollView,
  useWindowDimensions,
  Modal,
} from "react-native";
import useTTS from "../utils/useTTS";
import { useNavigation } from "@react-navigation/native";

const GRID_SIZE = 8;

// palavras (somente texto) - usadas para gerar/validar
const RAW_WORDS = ["CASA", "BOLA", "PATO", "GATO"];

// mapa de imagens (verifique o caminho relativo à pasta screens/)
const WORD_IMAGES = {
  CASA: require("../assets/images/jogos/cacaPalavras/casa.png"),
  BOLA: require("../assets/images/jogos/cacaPalavras/bola.png"),
  PATO: require("../assets/images/jogos/cacaPalavras/pato.png"),
  GATO: require("../assets/images/jogos/cacaPalavras/gato.png"),
};

// Helper para extrair letras (mantive caso queira usar labels com emoji no futuro)
function onlyLetters(str) {
  return Array.from(str)
    .filter((ch) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(ch))
    .join("");
}

const DISPLAY_WORDS = RAW_WORDS; // o que mostramos (aqui apenas letras)
const SEARCH_WORDS = RAW_WORDS.map((w) => onlyLetters(w).toUpperCase());

// imagem de topo (mantive a sua)
const TOP_IMAGE = "/mnt/data/aae93119-ceb0-44cd-a0b1-1cfeb2ee94e3.png";

export default function CacaPalavrasScreen() {
  const { speak } = useTTS();
  const [foundWords, setFoundWords] = useState([]); // guarda labels (texto)
  const [currentSelection, setCurrentSelection] = useState("");
  const [foundCells, setFoundCells] = useState([]); // "r-c"
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [showCongrats, setShowCongrats] = useState(false);
  const [autoNavigateTimer, setAutoNavigateTimer] = useState(null);


  useEffect(() => {
    speak(`Vamos jogar caça palavras! As palavras escondidas são: ${SEARCH_WORDS.join(", ")}`);
  }, []);

  // --- COLE AQUI o useEffect do passo 3 ---
  useEffect(() => {
    if (foundWords.length > 0 && foundWords.length === SEARCH_WORDS.length) {
      setShowCongrats(true);

      speak(`Parabéns! Você encontrou todas as palavras! Excelente trabalho!`);

      const t = setTimeout(() => {
        setShowCongrats(false);
        navigation.replace("ModuloJogos"); // troque para SUA tela
      }, 3200);

      setAutoNavigateTimer(t);
    }

    return () => {
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
        setAutoNavigateTimer(null);
      }
    };
  }, [foundWords]);


  // Gera grid apenas uma vez
  const grid = useMemo(() => generateGrid(), []);

  // cálculo responsivo
  const horizontalPadding = 32;
  const marginCell = 6;
  const available = width - horizontalPadding;
  const cellSize = Math.floor((available - marginCell * (GRID_SIZE - 1)) / GRID_SIZE);
  const letterFontSize = Math.max(14, Math.floor(cellSize * 0.45));

  const handlePress = (r, c) => {
    const letter = grid[r][c];
    const newSelection = currentSelection + letter;
    setCurrentSelection(newSelection);

    const idx = SEARCH_WORDS.indexOf(newSelection);
    if (idx !== -1) {
      const label = DISPLAY_WORDS[idx];

      if (foundWords.includes(label)) {
        setCurrentSelection("");
        return;
      }

      // encontrar coordenadas da palavra (busca horizontal)
      let coords = [];
      for (let rr = 0; rr < GRID_SIZE; rr++) {
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          const slice = grid[rr].slice(cc, cc + newSelection.length).join("");
          if (slice === newSelection) {
            for (let k = 0; k < newSelection.length; k++) {
              coords.push(`${rr}-${cc + k}`);
            }
          }
        }
      }

      // salva palavra e células (evita duplicatas)
      setFoundWords((prev) => [...prev, label]);
      setFoundCells((prev) => {
        const set = new Set(prev);
        coords.forEach((cstr) => set.add(cstr));
        return Array.from(set);
      });

      speak(`Parabéns! Você encontrou a palavra ${newSelection}`);
      // Alert.alert("Parabéns!", `Você encontrou a palavra ${label}!`);
      setCurrentSelection("");
    }

    if (newSelection.length > 12) setCurrentSelection("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <ImageBackground
          source={{ uri: TOP_IMAGE }}
          style={styles.topImage}
          imageStyle={{ opacity: 0.12 }}
        >
          <View style={styles.topBar}>
            <Image
              source={require("../assets/images/jogos/cacaPalavras/titulo.png")}
              style={styles.titleImage}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        {/* ---------- Congrats Modal ---------- */}
        <Modal visible={showCongrats} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* imagem divertida — use o arquivo que eu gerei localmente */}
              <Image
                source={require("../assets/images/jogos/cacaPalavras/concluiu.png")}
                style={styles.modalImage}
                resizeMode="contain"
              />

              <Text style={styles.modalTitle}>Parabéns!</Text>
              <Text style={styles.modalSubtitle}>Você encontrou todas as palavras 🎉</Text>

              <TouchableOpacity
                style={styles.modalButton}
                activeOpacity={0.8}
                onPress={() => {
                  // cancelar timer e navegar na hora
                  if (autoNavigateTimer) {
                    clearTimeout(autoNavigateTimer);
                    setAutoNavigateTimer(null);
                  }
                  setShowCongrats(false);
                  setTimeout(() => {
                    setShowModal(false);
                    navigation.replace("NextScreen");
                  }, 10000);

                }}
              >
                {/* <Text style={styles.modalButtonText}>Continuar</Text> */}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* ---------- /Congrats Modal ---------- */}



        <View style={styles.container}>
          <View style={styles.wordsCard}>
            <Text style={styles.cardHeader}>Palavras escondidas</Text>

            {/* lista de palavras com imagens à esquerda */}
            <View style={styles.wordsContainer}>
              {DISPLAY_WORDS.map((lbl, idx) => {
                const text = lbl; // já é apenas palavra sem emoji
                const found = foundWords.includes(lbl);

                return (
                  <View key={`${lbl}-${idx}`} style={[styles.wordBadge, found && styles.wordBadgeFound]}>
                    {WORD_IMAGES[text] ? (
                      <Image source={WORD_IMAGES[text]} style={styles.wordIcon} resizeMode="contain" />
                    ) : null}

                    <Text style={[styles.wordText, styles.wordLabelFont, found && styles.wordTextFound]}>
                      {text}
                    </Text>

                    {found && (
                      <Image
                        source={require("../assets/images/jogos/cacaPalavras/check_.png")}
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* grid */}
            <View style={[styles.grid, { marginTop: 12 }]}>
              {grid.map((row, r) => (
                <View key={r} style={styles.row}>
                  {row.map((letter, c) => {
                    const coord = `${r}-${c}`;
                    const isFoundCell = foundCells.includes(coord);

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
                            backgroundColor: isFoundCell ? "#add778" : "#EC707A",
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
          </View>
          {/* 
          <View style={styles.foundPanel}>
            <Text style={styles.foundTitle}>Palavras encontradas</Text>
            <Text style={styles.foundWords}>{foundWords.length ? foundWords.join(", ") : "Nenhuma ainda 😄"}</Text>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


/* --- helpers --- */
/* --- helpers --- */
function generateGrid() {
  // 1) Cria grid vazio (nulls)
  const grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));

  // checa se cabe sem conflitar (permite sobrepor só se a letra já for igual)
  function canPlaceHorizontally(row, col, word) {
    if (col < 0 || col + word.length > GRID_SIZE) return false;
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

  // 2) Tenta posicionar cada palavra
  SEARCH_WORDS.forEach((word) => {
    let placed = false;
    const maxAttempts = 200;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const maxCol = GRID_SIZE - word.length;
      if (maxCol < 0) {
        console.warn(`Palavra "${word}" maior que GRID_SIZE, pulando.`);
        break;
      }
      const col = Math.floor(Math.random() * (maxCol + 1));

      if (canPlaceHorizontally(row, col, word)) {
        placeHorizontally(row, col, word);
        placed = true;
      }
    }

    // varredura determinística como fallback
    if (!placed) {
      outer: for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col <= GRID_SIZE - word.length; col++) {
          if (canPlaceHorizontally(row, col, word)) {
            placeHorizontally(row, col, word);
            placed = true;
            break outer;
          }
        }
      }
    }

    if (!placed) {
      console.warn(`Não foi possível posicionar a palavra "${word}" no grid.`);
    }
  });

  // 3) Preenche as células vazias com letras aleatórias
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return grid;
}


/* --- styles --- */
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
    aspectRatio: 200,      // aumenta a largura mantendo a proporção
    alignSelf: "center",
    marginTop: 10,
  },

  topBar: { width: "92%", alignItems: "center" },
  title: { fontSize: 30, fontWeight: "800", color: "#3f3f3f" },
  subtitle: { marginTop: 6, fontSize: 15, color: "#5b5b5b" },

  container: { alignItems: "center", paddingHorizontal: 16, paddingTop: 10 },

  wordsCard: {
    width: "105%",
    backgroundColor: "#fff7ee",
    borderRadius: 16,
    padding: 25,
    marginBottom: 16,
    // sombra leve
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: { fontSize: 16, color: "#6b6f76", fontWeight: "700", marginBottom: 8 },

  // words list
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
    backgroundColor: "rgba(173, 215, 120, 0.4)", // verde com transparência
  },
  wordIcon: { width: 50, height: 50, marginRight: 10 },
  wordText: { fontSize: 15, color: "#4e4e4e", fontWeight: "700" },
  wordLabelFont: { fontSize: 15, fontWeight: "700" },
  wordTextFound: { color: "#6A9D3F", textDecorationLine: "line-through" },
  foundCheck: { marginLeft: 8, fontSize: 16 },

  // grid
  grid: { marginTop: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" },
  cell: { borderRadius: 12, justifyContent: "center", alignItems: "center" },
  letter: { color: "#fff", fontWeight: "800" },

  foundTitle: { fontSize: 16, fontWeight: "800", color: "#ec707a" },
  foundWords: { marginTop: 6, fontSize: 15 },
  checkIcon: {
    width: 22,
    height: 22,
    marginLeft: 6,
  },

  // congrats modal styles
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
    // sombra
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalImage: {
    width: 260,
    height: 260,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3f3f3f",
    marginTop: 6,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#6b6f76",
    marginTop: 8,
    textAlign: "center",
  },
  // modalButton: {
  //   marginTop: 14,
  //   backgroundColor: "#EC707A", // rosa do app
  //   paddingVertical: 10,
  //   paddingHorizontal: 22,
  //   borderRadius: 14,
  // },
  modalButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },


});
