// JogoMemoriaScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import useTTS from '../utils/useTTS';
import AsyncStorage from '@react-native-async-storage/async-storage';

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function repeatEmoji(emoji, times) {
  return Array(times).fill(emoji).join(' ');
}

export default function JogoMemoriaScreen({ navigation, route }) {
  // level param (1..4). default 1
  const level = Math.max(1, Math.min(4, route?.params?.level || 1));
  // progressKey vem dos params; se não passar, usa padrao para retrocompatibilidade
  const progressKey = route?.params?.progressKey || 'caca_progress_global';
  const { speak } = useTTS ? useTTS() : { speak: () => {} };

  // Difficulty map for 4 levels (soft progression)
  const DIFFICULTY = useMemo(() => ({
    1: { pairs: 3, columns: 2, fruit: '🍎' },  // 6 cards
    2: { pairs: 4, columns: 3, fruit: '🍌' },  // 8 cards
    3: { pairs: 5, columns: 3, fruit: '🍒' },  // 10 cards (middle, slightly harder)
    4: { pairs: 6, columns: 4, fruit: '🍇' },  // 12 cards
  }), []);

  const { pairs, columns, fruit } = DIFFICULTY[level] || DIFFICULTY[1];

  // dynamic card size
  const { width } = Dimensions.get('window');
  const CARD_MARGIN = 8;
  const horizontalPadding = 32;
  const CARD_SIZE = Math.floor((width - horizontalPadding - CARD_MARGIN * (columns * 2)) / columns);

  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]); // indexes currently flipped
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startNewGame();
    // speak an instruction when opening a level
    speak?.(`Você abriu o nível ${level}. Encontre os pares que representam as mesmas quantidades.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function buildDeck(nPairs) {
    const cards = [];
    for (let i = 1; i <= nPairs; i++) {
      cards.push({
        id: `fruit-${i}`,
        kind: 'fruit',
        count: i,
        face: repeatEmoji(fruit, i),
      });
      cards.push({
        id: `dots-${i}`,
        kind: 'dots',
        count: i,
        face: repeatEmoji('⚫', i),
      });
    }
    return shuffle(cards);
  }

  function startNewGame() {
    const d = buildDeck(pairs);
    setDeck(d);
    setMatchedIds(new Set());
    setMoves(0);
    setBusy(false);
    // iniciar com cartas viradas para baixo
    setFlipped([]);
  }

  async function saveLevelComplete(lvl) {
    try {
      const raw = await AsyncStorage.getItem(progressKey);
      let data;
      try {
        data = raw ? JSON.parse(raw) : { completed: [] };
      } catch (err) {
        data = { completed: [] };
      }

      const completedRaw = Array.isArray(data.completed) ? data.completed : [];
      const completedNums = completedRaw.map((v) => Number(v)).filter((n) => Number.isFinite(n));

      if (!completedNums.includes(lvl)) {
        const newCompleted = [...completedNums, lvl]
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort((a, b) => a - b);
        await AsyncStorage.setItem(progressKey, JSON.stringify({ completed: newCompleted }));
        console.log('[saveLevelComplete] saved', progressKey, newCompleted);
      } else {
        console.log('[saveLevelComplete] já tinha:', lvl);
      }
    } catch (err) {
      console.error('Erro ao salvar progresso', err);
    }
  }

  function onPressCard(index) {
    if (busy) return;
    const card = deck[index];
    if (!card) return;
    if (matchedIds.has(card.id)) return; // already matched
    if (flipped.includes(index)) return; // already flipped

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);
      setMoves(m => m + 1);
      const [i1, i2] = newFlipped;
      const c1 = deck[i1];
      const c2 = deck[i2];

      // match: same count and different kind
      if (c1.count === c2.count && c1.kind !== c2.kind) {
        setTimeout(() => {
          setMatchedIds(prev => {
            const nxt = new Set(prev);
            nxt.add(c1.id);
            nxt.add(c2.id);
            return nxt;
          });
          setFlipped([]);
          setBusy(false);
          speak?.('Acertou!');
        }, 450);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setBusy(false);
          speak?.('Tente outra vez.');
        }, 700);
      }
    }
  }

  // quando todas as cartas forem casadas, grava e volta para níveis
  useEffect(() => {
    if (deck.length > 0 && matchedIds.size === deck.length) {
      const finish = async () => {
        speak?.('Parabéns! Você completou o nível.');
        await saveLevelComplete(level); // grava progresso nesta chave
        // mostra alert com opções; ao voltar a tela de níveis ela recarrega via listener 'focus'
        Alert.alert('Parabéns', `Você completou o nível ${level} em ${moves} jogadas.`, [
          {
            text: 'Voltar aos níveis',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Jogar de novo',
            onPress: () => startNewGame(),
          },
        ]);
      };
      setTimeout(finish, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds, deck, moves]);

  function renderCard({ item, index }) {
    const isFlipped = flipped.includes(index) || matchedIds.has(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onPressCard(index)}
        style={[
          styles.card,
          { width: CARD_SIZE, height: CARD_SIZE, margin: CARD_MARGIN },
          isFlipped ? styles.cardFaceUp : styles.cardFaceDown,
        ]}
        accessible
        accessibilityLabel={`Carta ${index + 1}`}
      >
        {isFlipped ? (
          <Text style={[styles.cardText, { fontSize: Math.max(18, Math.floor(CARD_SIZE / 4)) }]}>{item.face}</Text>
        ) : (
          <Text style={[styles.backText, { fontSize: Math.max(20, Math.floor(CARD_SIZE / 3)) }]}>🔷</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nível {level} — Jogo da Memória</Text>

      <View style={styles.infoRow}>
        <Text style={styles.info}>Movimentos: {moves}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={startNewGame} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Reiniciar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.smallButton, { marginLeft: 8 }]}>
            <Text style={styles.smallButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={deck}
        keyExtractor={(i, idx) => i.id + '-' + idx}
        renderItem={renderCard}
        numColumns={columns}
        contentContainerStyle={[styles.grid, { paddingBottom: 20 }]}
        scrollEnabled={true}
      />

      <View style={styles.hintRow}>
        <Text style={styles.hint}>Toque em duas cartas para encontrar os pares (frutas ⇄ bolinhas).</Text>
      </View>
    </View>
  );
}

const CARD_MARGIN = 8;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFDF7', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginTop: 8, marginBottom: 12, color: '#4A90E2' },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: { fontSize: 16, fontWeight: '700' },
  smallButton: { backgroundColor: '#6C63FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  smallButtonText: { color: '#fff', fontWeight: '700' },
  grid: { alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardFaceDown: { backgroundColor: '#e2e8f0' },
  cardFaceUp: { backgroundColor: '#fff' },
  cardText: { textAlign: 'center' },
  backText: { textAlign: 'center' },
  hintRow: { marginTop: 18, paddingHorizontal: 16 },
  hint: { fontSize: 16, textAlign: 'center', color: '#4a5568', maxWidth: 420 },
});
