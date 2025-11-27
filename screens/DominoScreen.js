// DominioMathGame.js (layout atualizado — lógica INTACTA)
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  Image,
  Modal,
} from 'react-native';
import useTTS from '../utils/useTTS';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const dotsFace = repeatEmoji('⚪', n);
    cards.push({ id: `vis-${idx}-${n}`, kind: 'visual', count: n, face: visual });
    cards.push({ id: `dot-${idx}-${n}`, kind: 'dots', count: n, face: dotsFace });
  });
  return shuffle(cards);
}

const LEVELS_CONFIG = {
  1: { pairsCount: 2, fruit: '🍍' },
  2: { pairsCount: 3, fruit: '🍊' },
  3: { pairsCount: 4, fruit: '🍒' },
  4: { pairsCount: 6, fruit: '🍇' },
};

const CONGRATS_IMAGE = require("../assets/images/jogos/cacaPalavras/check.png");

export default function DominioMathGame({ route, navigation }) {
  const { speak } = useTTS ? useTTS() : { speak: () => { } };

  const level = Math.max(1, Math.min(4, Number(route?.params?.level) || 1));
  const config = LEVELS_CONFIG[level] || LEVELS_CONFIG[1];
  const { pairsCount, fruit } = config;

  const numbers = useMemo(() => Array.from({ length: pairsCount }, (_, i) => i + 1), [pairsCount]);

  const [deck, setDeck] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [matchedIds, setMatchedIds] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const timerRef = useRef(null);

  const PROGRESS_KEY = 'domino_progress_global'; // use a mesma chave que a tela de Levels

  async function saveLevelComplete(lvl) {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      let data;
      try { data = raw ? JSON.parse(raw) : { completed: [] }; } catch (e) { data = { completed: [] }; }
      const completedRaw = Array.isArray(data.completed) ? data.completed : [];
      const completedNums = completedRaw.map((v) => Number(v)).filter((n) => Number.isFinite(n));
      if (!completedNums.includes(lvl)) {
        const newCompleted = [...completedNums, lvl]
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort((a, b) => a - b);
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: newCompleted }));
        console.log('[saveLevelComplete] salvo', PROGRESS_KEY, newCompleted);
      }
    } catch (err) {
      console.error('[saveLevelComplete] erro ao salvar progresso', err);
    }
  }


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
      const finish = async () => {
        speak?.('Parabéns! Você terminou o nível.');

        // salva progresso (essencial para desbloquear próximo nível)
        await saveLevelComplete(level);

        // mostra o modal igual ao JogoMemoria
        setShowCongrats(true);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        timerRef.current = setTimeout(() => {
          setShowCongrats(false);
          timerRef.current = null;

          // volta para a tela de níveis (como você pediu)
          navigation.goBack();
        }, 3200);
      };

      setTimeout(finish, 300);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds, deck, moves]);

  // UI sizing (mantive seu cálculo original para itemSize)
  const { width, height } = Dimensions.get('window');
  const numColumns = 2;
  const ITEM_MARGIN = 14;
  const maxItem = 160;
  const itemSize = Math.min(maxItem, Math.floor((width - ITEM_MARGIN * (numColumns + 1)) / numColumns));

  // Adaptando layout: semelhante ao JogoMemoriaScreen – cards maiores e centralizados.
  // Para renderItem, mantemos exatamente sua lógica.
  function renderItem({ item, index }) {
    const isMatched = matchedIds.has(item.id);
    const isSelected = selectedIdx === index;
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.95}
        onPress={() => tryMatch(index)}
        style={[
          styles.card,
          { width: itemSize, height: itemSize, margin: ITEM_MARGIN / 2 },
          isMatched ? styles.cardFaceUp : isSelected ? styles.cardFaceUp : styles.cardFaceDown,
        ]}
        accessibilityLabel={`Peça ${index + 1}`}
      >
        <Text
          style={[
            styles.faceText,
            {
              fontSize: Math.max(14, Math.floor(itemSize / 6)),
              textAlign: 'center',
            },
          ]}
          numberOfLines={2}         // permite até 2 linhas (mostra "🍊 + 🍊" sem cortar)
          adjustsFontSizeToFit      // reduz a fonte se necessário
          allowFontScaling={true}
        >
          {item.face}
        </Text>

      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.outer}>
      {/* header (estrelas + nível + som) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerCard}>
          <View style={styles.starsRow}>
            {Array.from({ length: 4 }).map((_, i) => {
              const filled = i < Math.min(4, level);
              return (
                <Text
                  key={i}
                  style={[styles.starEmoji, filled ? styles.starEmojiFilled : styles.starEmojiEmpty]}
                >
                  {filled ? '★' : '☆'}
                </Text>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => speak(`Nível ${level}`)}
            style={styles.heroButton}
          >
            <View
              style={[
                styles.heroCircle,
                {
                  width: 110,
                  height: 110,
                  borderRadius: 60,
                  transform: [{ translateX: -10 }],
                },
              ]}
            >
              <Text style={[styles.heroNumber, { fontSize: 65, position: 'absolute', left: 0, right: 0, textAlign: 'center' }]}>
                {level}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.speakerButton} onPress={() => speak(`Vamos jogar! Nível ${level}`)}>
            <Text style={styles.speakerEmoji}>🔊</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* cards wrapper (cartão bege parecido com JogoMemoriaScreen) */}
      <View style={styles.cardsWrapper}>
        <FlatList
          data={deck}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 30,
            paddingTop: 8,
          }}
          columnWrapperStyle={{ justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          extraData={[selectedIdx, Array.from(matchedIds)]}
        />
      </View>

      <Modal
        visible={showCongrats}
        animationType="fade"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image source={CONGRATS_IMAGE} style={styles.congratsImage} />

            <Text style={styles.modalTitle}>Parabéns</Text>
            <Text style={styles.modalSubtitle}>Você concluiu!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- STYLES (layout inspirado em JogoMemoriaScreen) ---------- */
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#FFFDF7' },

  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 6,
    backgroundColor: '#add778',
  },

  headerCard: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffefc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,

    // sombra suave
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  cardsWrapper: {
    width: '98%',
    alignSelf: 'center',

    backgroundColor: '#fff7ee',
    borderRadius: 16,

    paddingVertical: 14,
    paddingHorizontal: 5,

    // sombra
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,

    // evita overflow
    flexShrink: 1,
    margin: 12,
  },

  starsRow: { flexDirection: 'row', alignItems: 'center' },
  starEmoji: { fontSize: 26, marginRight: 6, lineHeight: 30 },
  starEmojiFilled: { color: '#FFD24D' },
  starEmojiEmpty: { color: '#C4C4C4' },

  heroButton: { alignItems: 'center', justifyContent: 'center' },
  heroCircle: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF6F7', borderWidth: 1, borderColor: 'rgba(236,112,122,0.14)' },
  heroNumber: { color: '#ec707a', fontWeight: '900', textAlign: 'center' },

  speakerButton: { width: 48, height: 48, borderRadius: 48, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', elevation: 3 },
  speakerEmoji: { fontSize: 20 },

  grid: { alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  cardFaceDown: { backgroundColor: '#FFF5B8' },
  cardFaceUp: { backgroundColor: '#DFF0C7' },
  cardText: {
    textAlign: 'center',
    fontWeight: '800',
    flexWrap: 'nowrap',
    includeFontPadding: false,
  },
  backText: { textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  congratsImage: {
    width: 140,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },

  modalButton: {
    backgroundColor: '#add778',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
