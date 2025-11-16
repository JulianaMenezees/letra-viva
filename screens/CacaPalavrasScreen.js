import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useTTS from '../utils/useTTS';   // ← IMPORTANTE

const GRID_SIZE = 8;

// Palavras fáceis
const WORDS = ["CASA", "BOLA", "PATO", "MESA"];

export default function CacaPalavrasScreen() {
  const { speak } = useTTS();      // ← TTS habilitado aqui
  const [foundWords, setFoundWords] = useState([]);

  useEffect(() => {
    speak(`Vamos jogar caça palavras! As palavras escondidas são: ${WORDS.join(", ")}`);
  }, []);

  // Criar o tabuleiro
  const generateGrid = () => {
    let grid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      )
    );

    // inserir palavras horizontalmente
    WORDS.forEach(word => {
      let row = Math.floor(Math.random() * GRID_SIZE);
      let col = Math.floor(Math.random() * (GRID_SIZE - word.length));

      for (let i = 0; i < word.length; i++) {
        grid[row][col + i] = word[i];
      }
    });

    return grid;
  };

  const [grid] = useState(generateGrid());
  const [currentSelection, setCurrentSelection] = useState("");

  const handlePress = (letter) => {
    const newSelection = currentSelection + letter;
    setCurrentSelection(newSelection);

    // Se a seleção formar uma das palavras
    if (WORDS.includes(newSelection)) {
      setFoundWords(prev => [...prev, newSelection]);

      // 🔊 FAZER A PALAVRA FALADA
      speak(`Parabéns! Você encontrou a palavra ${newSelection}`);

      Alert.alert("Parabéns!", `Você encontrou a palavra ${newSelection}!`);
      setCurrentSelection("");
    }

    if (newSelection.length > 8) setCurrentSelection("");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>🔍 Caça Palavras</Text>

      <Text style={styles.subtitle}>Toque nas letras e forme palavras!</Text>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Palavras escondidas: {WORDS.join(", ")}
      </Text>

      <View style={styles.grid}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((letter, c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.cell,
                  { backgroundColor: foundWords.includes(letter) ? "#90ee90" : "#6C63FF" }
                ]}
                onPress={() => handlePress(letter)}
              >
                <Text style={styles.letter}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.foundTitle}>Palavras encontradas:</Text>
      <Text style={styles.foundWords}>
        {foundWords.length ? foundWords.join(", ") : "Nenhuma ainda 😄"}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#FFFDF7" },
  title: { fontSize: 32, fontWeight: "bold", color: "#4A90E2", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#555" },
  grid: { marginTop: 10 },
  row: { flexDirection: "row" },
  cell: {
    width: 40,
    height: 40,
    margin: 4,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8
  },
  letter: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  foundTitle: { marginTop: 20, fontSize: 20, fontWeight: "bold" },
  foundWords: { fontSize: 18, marginTop: 6 }
});
