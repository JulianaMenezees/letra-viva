// DominioMathGame.js (ajustado para permitir rolagem quando muitas cartas)
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import useTTS from '../utils/useTTS';

const TITLE_IMAGE = '/mnt/data/A_2D_digital_graphic_design_displays_the_title_"Jo.png';

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function repeatEmoji(e, t) {
  return Array(t).fill(e).join(' ');
}

function buildPairs(numbers, fruit = '🍊') {
  const cards = [];
  numbers.forEach((n, idx) => {
    const a = Math.max(1, Math.floor(n / 2));
    const b = n - a;
    const left = a > 0 ? repeatEmoji(fruit, a) : '';
    const rightPart = b > 0 ? ` + ${repeatEmoji(fruit, b)}` : '';
    const visualFace = `${left}${b > 0 ? rightPart : ''}`.trim();
    const visual = visualFace.length ? visualFace : repeatEmoji(fruit, n);
    const dotsFace = repeatEmoji('⚫', n);
    cards.push({ id: `vis-${idx}-${n}`, kind: 'visual', count: n, face: visual });
    cards.push({ id: `dot-${idx}-${n}`, kind: 'dots', count: n, face: dotsFace });
  });
  return shuffle(cards);
}

const LEVELS_CONFIG = {
  1: { pairsCount: 2, fruit: '🍌' },
  2: { pairsCount: 3, fruit: '🍊' },
  3: { pairsCount: 4, fruit: '🍒' },
  4: { pairsCount: 6, fruit: '🍇' },
};

export default function DominioMathGame({ route, navigation }) {
  const { speak } = useTTS ? useTTS() : { speak: () => {} };

  const level = Math.max(1, Math.min(4, Number(route?.params?.level) || 1));
  const config = LEVELS_CONFIG[level] || LEVELS_CONFIG[1];
  const { pairsCount, fruit } = config;

  const numbers = useMemo(() => Array.from({ length: pairsCount }, (_, i) => i + 1), [pairsCount]);

  const [deck, setDeck] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [matchedIds, setMatchedIds] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startGame();
    speak?.(`Nível ${level}. Toque em uma peça e depois na outra para conectar somas iguais.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function startGame() {
    const d = buildPairs(numbers, fruit);
    setDeck(d);
    setSelectedIdx(null);
    setMatchedIds(new Set());
    setMoves(0);
    setBusy(false);
  }

  function tryMatch(i) {
    if (busy) return;
    if (!deck || !deck[i]) return;
    if (matchedIds.has(deck[i].id)) return;

    if (selectedIdx === null) {
      setSelectedIdx(i);
      speak?.('Peça selecionada.');
      return;
    }

    if (selectedIdx === i) {
      setSelectedIdx(null);
      return;
    }

    setBusy(true);
    setMoves((m) => m + 1);

    const a = deck[selectedIdx];
    const b = deck[i];
    const matched = a.count === b.count && a.kind !== b.kind;

    setTimeout(() => {
      if (matched) {
        setMatchedIds((prev) => {
          const nxt = new Set(prev);
          nxt.add(a.id);
          nxt.add(b.id);
          return nxt;
        });
        speak?.('Acertou!');
      } else {
        speak?.('Tente outra vez.');
      }
      setSelectedIdx(null);
      setBusy(false);
    }, matched ? 350 : 500);
  }

  useEffect(() => {
    if (!deck || deck.length === 0) return;
    if (matchedIds.size === deck.length) {
      setTimeout(() => {
        speak?.('Parabéns! Você terminou o nível.');
        Alert.alert('Parabéns', `Você completou o nível ${level} em ${moves} movimentos.`, [
          {
            text: 'Próximo nível',
            onPress: () => {
              if (level < 4) navigation.replace('DominoScreen', { level: level + 1 });
              else Alert.alert('Parabéns', 'Você completou o último nível!');
            },
          },
          { text: 'Jogar de novo', onPress: startGame },
          { text: 'Fechar', style: 'cancel' },
        ]);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds, deck, moves]);

  // UI sizing
  const { width, height } = Dimensions.get('window');
  const numColumns = 2;
  const ITEM_MARGIN = 14;
  // cap itemSize so items never exceed reasonable size, and to better fit many cards
  const maxItem = 160;
  const itemSize = Math.min(maxItem, Math.floor((width - ITEM_MARGIN * (numColumns + 1)) / numColumns));

  function renderItem({ item, index }) {
    const isMatched = matchedIds.has(item.id);
    const isSelected = selectedIdx === index;
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.95}
        onPress={() => tryMatch(index)}
        style={[
          styles.tile,
          { width: itemSize, height: itemSize, margin: ITEM_MARGIN / 2 },
          isMatched ? styles.tileMatched : isSelected ? styles.tileSelected : styles.tileIdle,
        ]}
        accessibilityLabel={`Peça ${index + 1}`}
      >
        <Text style={[styles.faceText, { fontSize: Math.max(18, Math.floor(itemSize / 6)) }]}>{item.face}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrap}>
      <Image source={{ uri: TITLE_IMAGE }} style={styles.titleImg} resizeMode="contain" />
      <Text style={styles.title}>Dominó de Contas — Nível {level}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.info}>Movimentos: {moves}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={startGame} style={styles.resetButton}>
            <Text style={styles.resetText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* IMPORTANT: FlatList fills available space and is scrollable */}
      <FlatList
        data={deck}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        numColumns={numColumns}
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={[styles.grid, { paddingVertical: 12, alignItems: 'center' }]}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={false}
      />

      <View style={{ height: 12 }} />
      <Text style={styles.hint}>Toque em uma peça e depois na outra para conectar somas iguais.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // allow FlatList to fill the space
  wrap: { flex: 1, padding: 18, alignItems: 'stretch', backgroundColor: '#FFFDF7' },
  titleImg: { width: '70%', height: 86, marginTop: 6, marginBottom: 8, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: '#4A90E2', textAlign: 'center' },
  infoRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  info: { fontSize: 18, fontWeight: '700' },
  resetButton: { backgroundColor: '#6C63FF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  resetText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  grid: { /* now contentContainerStyle controls centering */ },
  tile: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tileIdle: { backgroundColor: '#fff' },
  tileSelected: { backgroundColor: '#fff8e6', borderWidth: 2, borderColor: '#ffb84d' },
  tileMatched: { backgroundColor: '#cdebb0', opacity: 0.98 },
  faceText: { textAlign: 'center' },
  hint: { marginTop: 8, fontSize: 16, textAlign: 'center', color: '#4a5568', maxWidth: 460, alignSelf: 'center' },
});
