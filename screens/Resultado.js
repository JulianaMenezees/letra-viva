// CruzadinhaTecnologia.js — layout igual à imagem enviada
// Grade à esquerda + lista de dicas à direita

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
} from "react-native";

const COLORS = {
  BACKGROUND: "#F4F3EC",
  PINK: "#EC707A",
  PURPLE: "#9A5FCC",
  GREEN: "#ADD778",
  YELLOW: "#FEE78D",
  CELL_BG: "#FFFFFF",
  TEXT: "#222222",
  BLACK: "#000",
};

const WORDS = [
  { id: "EMAIL", word: "EMAIL", row: 2, col: 4, orient: "H", clue: "Ferramenta para enviar mensagens digitais." },
  { id: "CELULAR", word: "CELULAR", row: 0, col: 4, orient: "V", clue: "Aparelho para ligar, mandar mensagens e usar apps." },
  { id: "WIFI", word: "WIFI", row: 7, col: 0, orient: "H", clue: "Internet sem fio." },
  { id: "INTERNET", word: "INTERNET", row: 8, col: 1, orient: "H", clue: "Rede mundial que conecta pessoas e informações." },
  { id: "SENHA", word: "SENHA", row: 6, col: 8, orient: "V", clue: "Palavra secreta que protege contas." },
  { id: "ARQUIVO", word: "ARQUIVO", row: 11, col: 7, orient: "H", clue: "Documento ou item salvo no celular." },
];

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

export default function CruzadinhaTecnologia() {
  const { grid: SPARSE, rows: ROWS, cols: COLS, baseRow, baseCol } = useMemo(() => buildSparseGrid(WORDS), []);

  const [inputs, setInputs] = useState(() => SPARSE.map(row => row.map(cell => (cell ? "" : null))));

  const initialWordState = WORDS.reduce((acc, w) => {
    acc[w.id] = { active: false, index: 0, completed: false, correct: null };
    return acc;
  }, {});

  const [wordState, setWordState] = useState(initialWordState);
  const [activeWordId, setActiveWordId] = useState(null);

  const hiddenInputRef = useRef(null);
  const [hiddenValue, setHiddenValue] = useState("");

  const CELL_SIZE = 32;

  function activateWord(id) {
    if (!id || wordState[id].completed) return;
    setActiveWordId(id);
    setWordState(prev => ({ ...prev, [id]: { ...prev[id], active: true, index: 0 } }));
    setTimeout(() => hiddenInputRef.current?.focus(), 50);
  }

  function fillLetterForActive(letter) {
    if (!activeWordId) return;
    const w = WORDS.find(x => x.id === activeWordId);
    const st = wordState[activeWordId];
    const idx = st.index;
    if (idx >= w.word.length) return;

    const r = (w.row + (w.orient === "V" ? idx : 0)) - baseRow;
    const c = (w.col + (w.orient === "H" ? idx : 0)) - baseCol;

    setInputs(prev => {
      const cp = prev.map(row => row.slice());
      cp[r][c] = letter.toUpperCase();
      return cp;
    });

    const next = idx + 1;
    setWordState(prev => ({ ...prev, [activeWordId]: { ...prev[activeWordId], index: next } }));

    if (next >= w.word.length) verifyActiveWord();
  }

  function verifyActiveWord() {
    if (!activeWordId) return;
    const w = WORDS.find(x => x.id === activeWordId);

    let formed = "";
    for (let i = 0; i < w.word.length; i++) {
      const r = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
      const c = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
      formed += inputs[r][c] || "";
    }

    const correct = formed.toUpperCase() === w.word.toUpperCase();

    setWordState(prev => ({
      ...prev,
      [activeWordId]: { ...prev[activeWordId], completed: true, correct, active: false },
    }));

    setActiveWordId(null);
  }

  const handleHiddenText = (text) => {
    setHiddenValue(text);
    if (!activeWordId) return;
    if (/^[A-Za-zÀ-ÿ]$/.test(text)) fillLetterForActive(text);
    hiddenInputRef.current?.clear?.();
    setHiddenValue("");
  };

  function getCellStyle(r, c) {
    const sol = SPARSE[r][c];
    if (!sol) return styles.cellBlack;

    for (let w of WORDS) {
      for (let i = 0; i < w.word.length; i++) {
        const rr = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
        const cc = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
        if (rr === r && cc === c) {
          const st = wordState[w.id];
          if (st.completed) return st.correct ? styles.cellCorrect : styles.cellWrong;
        }
      }
    }

    if (activeWordId) {
      const w = WORDS.find(x => x.id === activeWordId);
      for (let i = 0; i < w.word.length; i++) {
        const rr = (w.row + (w.orient === "V" ? i : 0)) - baseRow;
        const cc = (w.col + (w.orient === "H" ? i : 0)) - baseCol;
        if (rr === r && cc === c) return styles.cellActive;
      }
    }

    return styles.cellWhite;
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.leftColumn}>
        <View style={styles.gridWrapper}>
          {Array.from({ length: ROWS }).map((_, r) => (
            <View key={r} style={{ flexDirection: "row" }}>
              {Array.from({ length: COLS }).map((_, c) => (
                <View
                  key={c}
                  style={[styles.cellBase, { width: CELL_SIZE, height: CELL_SIZE }, getCellStyle(r, c)]}
                >
                  <Text style={styles.letter}>{inputs[r][c]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.rightColumn}>
        <Text style={styles.clueTitle}>DICAS</Text>

        {WORDS.map(w => (
          <TouchableOpacity key={w.id} style={styles.clueBox} onPress={() => activateWord(w.id)}>
            <Text style={styles.clueWord}>{w.word}</Text>
            <Text style={styles.clueText}>{w.clue}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        ref={hiddenInputRef}
        style={{ width: 1, height: 1, opacity: 0.01, position: "absolute" }}
        value={hiddenValue}
        onChangeText={handleHiddenText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 10,
  },

  leftColumn: {
    width: "55%",
    alignItems: "center",
  },

  gridWrapper: {
    padding: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.PURPLE,
  },

  rightColumn: {
    width: "45%",
    padding: 10,
  },

  clueTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: COLORS.PURPLE,
  },

  clueBox: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  clueWord: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.PURPLE,
  },

  clueText: {
    fontSize: 14,
    marginTop: 4,
  },

  cellBase: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  cellWhite: { backgroundColor: "#fff" },
  cellBlack: { backgroundColor: "#000" },
  cellActive: { backgroundColor: COLORS.YELLOW },
  cellCorrect: { backgroundColor: COLORS.GREEN },
  cellWrong: { backgroundColor: COLORS.PINK },

  letter: {
    fontSize: 18,
    fontWeight: "700",
  },
});
