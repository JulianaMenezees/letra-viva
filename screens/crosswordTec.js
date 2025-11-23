// CruzadinhaTecnologia.js - versão corrigida
// (código completo entregue conforme solicitado)

// 🔧 IMPORTAÇÕES
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
  Keyboard,
  InteractionManager,
} from "react-native";
import LargeButton from "../components/LargeButton";

// 🎨 CORES
const COLORS = {
  BACKGROUND: "#E5DDC8",
  PINK: "#EC707A",
  PURPLE: "#9A5FCC",
  GREEN: "#ADD778",
  YELLOW: "#FEE78D",
  CELL_BG: "#FFFFFF",
  TEXT: "#222222",
};

// PALAVRAS DA CRUZADINHA
const WORDS = [
  { id: "EMAIL", word: "EMAIL", row: 2, col: 4, orient: "H", clue: "Ferramenta para enviar mensagens digitais." },
  { id: "CELULAR", word: "CELULAR", row: 0, col: 4, orient: "V", clue: "Aparelho para ligar, mandar mensagens e usar apps." },
  { id: "WIFI", word: "WIFI", row: 7, col: 0, orient: "H", clue: "Internet sem fio." },
  { id: "INTERNET", word: "INTERNET", row: 8, col: 1, orient: "H", clue: "Rede mundial que conecta pessoas e informações." },
  { id: "SENHA", word: "SENHA", row: 6, col: 8, orient: "V", clue: "Palavra secreta que protege contas." },
  { id: "ARQUIVO", word: "ARQUIVO", row: 11, col: 7, orient: "H", clue: "Documento ou item salvo no celular." },
];

// 🔲 CRIA GRID ESPARS0 E RECORTADO
function buildSparseGrid(words) {
  let maxR = -Infinity, maxC = -Infinity, minR = Infinity, minC = Infinity;

  words.forEach(w => {
    if (w.orient === "H") {
      minR = Math.min(minR, w.row);
      minC = Math.min(minC, w.col);
      maxR = Math.max(maxR, w.row);
      maxC = Math.max(maxC, w.col + w.word.length - 1);
    } else {
      minR = Math.min(minR, w.row);
      minC = Math.min(minC, w.col);
      maxR = Math.max(maxR, w.row + w.word.length - 1);
      maxC = Math.max(maxC, w.col);
    }
  });

  const margin = 1;
  const rows = maxR - minR + 1 + margin * 2;
  const cols = maxC - minC + 1 + margin * 2;
  const baseRow = minR - margin;
  const baseCol = minC - margin;

  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  words.forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
      const r = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
      const c = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
      if (r >= 0 && c >= 0 && r < rows && c < cols) grid[r][c] = w.word[i].toUpperCase();
    }
  });

  return { grid, rows, cols, baseRow, baseCol };
}

// 📘 COMPONENTE PRINCIPAL
export default function CruzadinhaTecnologia({ navigation, route }) {
  const liberado = route?.params?.liberado ?? false;

  useEffect(() => {
    if (!liberado) {
      Alert.alert("Acesso bloqueado", "Você precisa completar o quiz antes de acessar a prova.", [
        { text: "OK", onPress: () => navigation.replace("ModuleTecnology") },
      ]);
    }
  }, [liberado]);

  const { grid: SPARSE, rows: SP_ROWS, cols: SP_COLS, baseRow, baseCol } = useMemo(() => buildSparseGrid(WORDS), []);

  const [inputs, setInputs] = useState(() => SPARSE.map(row => row.map(cell => (cell ? "" : null))));

  // Estado das palavras
  const initialWordState = WORDS.reduce((acc, w) => {
    acc[w.id] = { active: false, index: 0, completed: false, correct: null };
    return acc;
  }, {});

  const [wordState, setWordState] = useState(initialWordState);
  const [activeWordId, setActiveWordId] = useState(null);
  const [clueOpen, setClueOpen] = useState(false);
  const [clueWord, setClueWord] = useState(null);
  const [finishModal, setFinishModal] = useState(false);

  // TEXTO OCULTO
  const hiddenInputRef = useRef(null);
  const [hiddenValue, setHiddenValue] = useState("");

  // DIMENSIONAMENTO RESPONSIVO
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const maxGridWidth = windowWidth - 40;
  const COLS = SP_COLS;
  const ROWS = SP_ROWS;

  const CELL_SIZE = Math.min(40, Math.floor(maxGridWidth / COLS));

  // Funções auxiliares
  const findWordById = id => WORDS.find(w => w.id === id);

  function activateWord(id) {
    if (!id || wordState[id].completed) return;

    setActiveWordId(id);
    setClueWord(findWordById(id));
    setClueOpen(true);

    setWordState(prev => ({ ...prev, [id]: { ...prev[id], active: true, index: 0 } }));
  }

  function closeClueAndFocus() {
    setClueOpen(false);
    setTimeout(() => hiddenInputRef.current?.focus(), 80);
  }

  function fillLetterForActive(letter) {
    if (!activeWordId) return;

    const w = findWordById(activeWordId);
    const st = wordState[activeWordId];
    const idx = st.index;
    if (idx >= w.word.length) return;

    const r = (w.row + (w.orient === "V" ? idx : 0)) - baseRow;
    const c = (w.col + (w.orient === "H" ? idx : 0)) - baseCol;

    setInputs(prev => {
      const copy = prev.map(row => row.slice());
      copy[r][c] = (letter || "").toUpperCase();
      return copy;
    });

    const nextIndex = idx + 1;
    setWordState(prev => ({ ...prev, [activeWordId]: { ...prev[activeWordId], index: nextIndex } }));

    if (nextIndex >= w.word.length) setTimeout(() => verifyActiveWord(), 200);
  }

  function backspaceForActive() {
    if (!activeWordId) return;

    const st = wordState[activeWordId];
    const idx = Math.max(0, st.index - 1);
    const w = findWordById(activeWordId);

    const r = (w.row + (w.orient === "V" ? idx : 0)) - baseRow;
    const c = (w.col + (w.orient === "H" ? idx : 0)) - baseCol;

    setInputs(prev => {
      const copy = prev.map(row => row.slice());
      copy[r][c] = "";
      return copy;
    });

    setWordState(prev => ({ ...prev, [activeWordId]: { ...prev[activeWordId], index: idx } }));
  }

  function verifyActiveWord() {
    if (!activeWordId) return;

    const w = findWordById(activeWordId);
    let formed = "";

    for (let i = 0; i < w.word.length; i++) {
      const r = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
      const c = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
      formed += (inputs[r][c] || "").toUpperCase();
    }

    const correct = formed === w.word.toUpperCase();

    setWordState(prev => ({ ...prev, [activeWordId]: { ...prev[activeWordId], correct, completed: true, active: false } }));

    setActiveWordId(null);
    setClueOpen(false);
    Keyboard.dismiss();
  }

  const handleHiddenText = (text) => {
    setHiddenValue(text);

    if (!activeWordId) {
      hiddenInputRef.current?.clear?.();
      setHiddenValue("");
      return;
    }

    if (/^[A-Za-zÀ-ÿ]$/.test(text)) {
      fillLetterForActive(text);
    } else if (text === "") {
      backspaceForActive();
    }

    hiddenInputRef.current?.clear?.();
    setHiddenValue("");
  };

  function getCellStyle(r, c) {
    const sol = SPARSE[r][c];
    if (!sol) return styles.cellEmpty;

    for (let w of WORDS) {
      for (let i = 0; i < w.word.length; i++) {
        const rr = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
        const cc = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
        if (rr === r && cc === c) {
          const st = wordState[w.id];
          if (st && st.completed) return st.correct ? styles.cellCorrect : styles.cellWrong;
        }
      }
    }

    if (activeWordId) {
      const w = findWordById(activeWordId);
      for (let i = 0; i < w.word.length; i++) {
        const rr = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
        const cc = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
        if (rr === r && cc === c) return styles.cellActive;
      }
    }

    return styles.cellNormal;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prova Final — Tecnologia</Text>
      <Text style={styles.subtitle}>Toque em uma palavra abaixo, veja a dica e comece a preencher.</Text>

      <View style={{ alignItems: "center" }}>
        <View style={[styles.gridWrap, { width: CELL_SIZE * COLS }]}>
          {Array.from({ length: ROWS }).map((_, r) => (
            <View key={`row-${r}`} style={{ flexDirection: "row" }}>
              {Array.from({ length: COLS }).map((_, c) => (
                <View
                  key={`cell-${r}-${c}`}
                  style={[styles.cellBase, { width: CELL_SIZE, height: CELL_SIZE }, getCellStyle(r, c)]}
                >
                  <Text style={styles.cellText}>{inputs[r][c] || ""}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* INPUT OCULTO */}
      <TextInput
        ref={hiddenInputRef}
        style={{ width: 1, height: 1, opacity: 0.01, position: "absolute" }}
        autoCorrect={false}
        autoCapitalize="characters"
        value={hiddenValue}
        onChangeText={handleHiddenText}
      />

      {/* BOTÕES DE PALAVRAS */}
      <View style={styles.wordList}>
        {WORDS.map(w => (
          <TouchableOpacity
            key={w.id}
            onPress={() => activateWord(w.id)}
            disabled={wordState[w.id].completed}
            style={[styles.wordButton, { backgroundColor: activeWordId === w.id ? COLORS.PINK : COLORS.PURPLE }]}
          >
            <Text style={styles.wordButtonText}>{w.word}</Text>
            <Text style={styles.wordButtonSmall}>
              {wordState[w.id].completed ? (wordState[w.id].correct ? "✓" : "✖") : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

// 🎀 ESTILOS
const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 20, backgroundColor: COLORS.BACKGROUND },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.PURPLE },
  subtitle: { marginVertical: 10, textAlign: "center", paddingHorizontal: 20 },
  gridWrap: { marginVertical: 20, padding: 6 },
  cellBase: {
    borderWidth: 1,
    borderColor: COLORS.PURPLE,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 4,
  },
  cellNormal: { backgroundColor: COLORS.CELL_BG },
  cellEmpty: { backgroundColor: "transparent", borrderWidth: 0 },
  cellActive: { backgroundColor: COLORS.PINK },
  cellCorrect: { backgroundColor: COLORS.GREEN },
  cellWrong: { backgroundColor: COLORS.PINK },
  cellText: { fontWeight: "700", color: COLORS.TEXT, fontSize: 18 },

  wordList: { width: "92%", marginTop: 10 },
  wordButton: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  wordButtonText: { color: "#FFF", fontWeight: "700", fontSize: 18 },
  wordButtonSmall: { color: "#FFF", fontWeight: "700" },
});
