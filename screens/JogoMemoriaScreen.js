// JogoMemoriaScreen.js (versão sem o cartão ao redor; cards maiores e centrados)
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  Image
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

const CONGRATS_IMAGE = require("../assets/images/jogos/cacaPalavras/check.png");

export default function JogoMemoriaScreen({ navigation, route }) {
  const level = Math.max(1, Math.min(4, route?.params?.level || 1));
  const progressKey = route?.params?.progressKey || 'caca_progress_global';
  const { speak } = useTTS ? useTTS() : { speak: () => { } };

  const DIFFICULTY = useMemo(() => ({
    1: { pairs: 3, columns: 2, fruit: '🍎' },  // 6 cards
    2: { pairs: 4, columns: 3, fruit: '🍊' },  // 8 cards
    3: { pairs: 5, columns: 3, fruit: '🍓' },  // 10 cards
    4: { pairs: 6, columns: 3, fruit: '🍇' },  // 12 cards
  }), []);

  const { pairs, columns, fruit } = DIFFICULTY[level] || DIFFICULTY[1];

  const { width, height } = Dimensions.get('window');
  const CARD_MARGIN = 8;
  const H_PADDING = 24; // padding horizontal total
  const V_PADDING = 24; // padding vertical total

  // número total de cartas e linhas esperadas
  const totalCards = pairs * 2;
  const rows = Math.ceil(totalCards / columns);

  // espaço reservado para header + controles (se ajustar header, altere aqui)
  const RESERVED_TOP = 160; // ajuste se seu header for maior/menor
  const RESERVED_BOTTOM = 60;
  const availableHeight = Math.max(120, height - RESERVED_TOP - RESERVED_BOTTOM - V_PADDING);

  // cálculo máximo permitido por largura e por altura (por linha)
  const maxByWidth = Math.floor((width - H_PADDING - CARD_MARGIN * (columns + 1)) / columns);
  const maxByHeight = Math.floor((availableHeight - CARD_MARGIN * (rows + 1)) / rows);

  // Prioriza manter as cartas grandes: tenta o maior possível dentro dos limites.
  // Garante um mínimo razoável (80) para não ficar pequeno em telas muito estreitas.
  const CARD_SIZE = Math.max(80, Math.min(260, Math.min(maxByWidth, maxByHeight)));

  // responsive header icon size
  const headerIconSize = Math.min(130, Math.floor(width * 0.26));

  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (showCongrats) {
      const timer = setTimeout(() => {
        setShowCongrats(false);
        navigation.goBack();
      }, 4000); //tempo de exibição

      return () => clearTimeout(timer);
    }
  }, [showCongrats]);


  useEffect(() => {
    startNewGame();
    speak?.(`Você abriu o nível ${level}. Encontre os pares que representam as mesmas quantidades.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function buildDeck(nPairs) {
    const cards = [];
    for (let i = 1; i <= nPairs; i++) {
      cards.push({ id: `fruit-${i}`, kind: 'fruit', count: i, face: repeatEmoji(fruit, i) });
      cards.push({ id: `dots-${i}`, kind: 'dots', count: i, face: repeatEmoji('⚪', i) });
    }
    return shuffle(cards);
  }

  function startNewGame() {
    const d = buildDeck(pairs);
    console.log('[startNewGame] deck gerado:', d.map((x, idx) => ({ idx, id: x.id, kind: x.kind, count: x.count })));
    setDeck(d);
    setMatchedIds(new Set());
    setMoves(0);
    setBusy(false);
    setFlipped([]);
  }

  async function saveLevelComplete(lvl) {
    try {
      const raw = await AsyncStorage.getItem(progressKey);
      let data;
      try { data = raw ? JSON.parse(raw) : { completed: [] }; } catch (err) { data = { completed: [] }; }
      const completedRaw = Array.isArray(data.completed) ? data.completed : [];
      const completedNums = completedRaw.map((v) => Number(v)).filter((n) => Number.isFinite(n));
      if (!completedNums.includes(lvl)) {
        const newCompleted = [...completedNums, lvl].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
        await AsyncStorage.setItem(progressKey, JSON.stringify({ completed: newCompleted }));
        console.log('[saveLevelComplete] saved', progressKey, newCompleted);
      }
    } catch (err) {
      console.error('Erro ao salvar progresso', err);
    }
  }

  function onPressCard(index) {
    if (busy) return;
    const card = deck[index];
    if (!card) return;
    if (matchedIds.has(card.id)) return;
    if (flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);
      setMoves(m => m + 1);
      const [i1, i2] = newFlipped;
      const c1 = deck[i1];
      const c2 = deck[i2];

      if (c1.count === c2.count && c1.kind !== c2.kind) {
        setTimeout(() => {
          setMatchedIds(prev => {
            const nxt = new Set(prev); nxt.add(c1.id); nxt.add(c2.id); return nxt;
          });
          setFlipped([]); setBusy(false); speak?.('Acertou!');
        }, 400);
      } else {
        setTimeout(() => { setFlipped([]); setBusy(false); speak?.('Tente outra vez.'); }, 700);
      }
    }
  }

  useEffect(() => {
    if (deck.length > 0 && matchedIds.size === deck.length) {
      const finish = async () => {
        speak?.('Parabéns! Você completou o nível.');
        await saveLevelComplete(level);

        setShowCongrats(true);
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
          <Text style={[styles.backText, { color: "#6b6f76", fontSize: Math.max(24, Math.floor(CARD_SIZE / 2.8)) }]}>◆</Text>
        )}
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
              return <Text key={i} style={[styles.starEmoji, filled ? styles.starEmojiFilled : styles.starEmojiEmpty]}>{filled ? '★' : '☆'}</Text>;
            })}
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={() => speak(`Nível ${level}`)} style={styles.heroButton}>
            <View style={[styles.heroCircle, { width: headerIconSize + 20, height: headerIconSize + 20, borderRadius: (headerIconSize + 20) / 2, transform: [{ translateX: -10 }], }]}>
              <Text style={[styles.heroNumber, { fontSize: Math.round(headerIconSize * 0.55), position: 'absolute', left: 0, right: 0, textAlign: 'center' }]}>{level}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.speakerButton} onPress={() => speak(`Vamos jogar! Nível ${level}`)}>
            <Text style={styles.speakerEmoji}>🔊</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* controles */}
      <View style={styles.infoRow}>
        {/* <TouchableOpacity onPress={startNewGame} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>↻</Text>
        </TouchableOpacity> */}
        {/* <Text style={styles.infoText}>  Movimentos: {moves}</Text> */}
      </View>

      {/* FlatList diretamente (sem wrapper) — columnWrapperStyle centraliza colunas */}
      <View style={styles.cardsWrapper}>
        <FlatList
          data={deck}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={columns}
          contentContainerStyle={{
            paddingHorizontal: H_PADDING / 2,
            paddingBottom: 30,
            paddingTop: 8,
          }}
          columnWrapperStyle={{ justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          extraData={[flipped, Array.from(matchedIds)]}
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

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#FFFDF7' },

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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,

    // sombra suave
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  cardsWrapper: {
    width: "98%",
    alignSelf: "center",

    backgroundColor: "#fff7ee",
    borderRadius: 16,

    paddingVertical: 14,
    paddingHorizontal: 5,

    // sombra
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,

    // muito importante para evitar "estouro"
    flexShrink: 1,
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

  infoRow: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 18, marginTop: 10 },
  smallButton: { backgroundColor: '#6C63FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  smallButtonText: { color: '#fff', fontWeight: '700' },
  infoText: { fontSize: 16, fontWeight: '700', marginLeft: 12 },

  grid: { alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  cardFaceDown: { backgroundColor: '#FFF5B8' },
  cardFaceUp: { backgroundColor: '#fff' },
  cardText: {
    textAlign: 'center',
    fontWeight: '800',
    flexWrap: 'nowrap',
    includeFontPadding: false,
  },
  backText: { textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  congratsImage: {
    width: 140,
    height: 180,
    resizeMode: "contain",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },

  modalButton: {
    backgroundColor: "#add778",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

});

