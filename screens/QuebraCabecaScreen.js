import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import useTTS from '../utils/useTTS';

// título (arquivo que você enviou)
const TITLE_IMAGE = '/mnt/data/A_2D_digital_graphic_features_the_word_"Dominó"_sp.png';

// Helpers
function repeatEmoji(e, times) {
  return Array(times).fill(e).join(' ');
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function makeChoices(correct, count = 4) {
  const choices = new Set([correct]);
  const spread = Math.max(2, Math.floor(correct * 0.4) + 1);
  while (choices.size < count) {
    const delta = (Math.random() < 0.6
      ? (Math.random() < 0.5 ? -1 : 1) * randInt(1, spread)
      : randInt(1, Math.max(2, spread)));
    const cand = Math.max(0, correct + delta);
    choices.add(cand);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

/**
 * CONFIG: 6 níveis (3 primeiros = frutas, 3 últimos = números)
 * - Ajuste min/max por nível conforme necessidade.
 */
const LEVELS = {
  1: { mode: 'fruit-fruit', min: 1, max: 3, fruit: '🍇' },
  2: { mode: 'fruit-fruit', min: 1, max: 4, fruit: '🍒' },
  3: { mode: 'fruit-fruit', min: 1, max: 5, fruit: '🍎' },
  4: { mode: 'number-number', min: 1, max: 6 },
  5: { mode: 'number-number', min: 2, max: 8 },
  6: { mode: 'number-number', min: 3, max: 10 },
};
const ROUNDS_PER_LEVEL = 5;

export default function QuebraCabecaNiveis({ route, navigation }) {
  const { speak } = useTTS ? useTTS() : { speak: () => {} };

  // recebe level pela rota (se não vier, usa 1)
  const initialLevel = Number(route?.params?.level) || 1;
  const maxLevel = Object.keys(LEVELS).length;
  const [level, setLevel] = useState(Math.max(1, Math.min(maxLevel, initialLevel)));
  const cfg = LEVELS[level];

  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [score, setScore] = useState(0);

  // peças e seleção (tap-to-place)
  const [placedLeft, setPlacedLeft] = useState(null);
  const [placedRight, setPlacedRight] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null); // 'A'|'B'|null

  // escolhas / feedback
  const [choices, setChoices] = useState([]);
  const [showChoices, setShowChoices] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct'|'wrong'|null

  // animação resultado
  const animScale = useRef(new Animated.Value(0.7)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  // modal final do nível
  const [modalVisible, setModalVisible] = useState(false);

  // Gera rounds (pares a,b) baseado no nível
  function genRoundsForLevel(lv) {
    const conf = LEVELS[lv];
    const arr = [];
    for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
      const a = randInt(conf.min, conf.max);
      const b = randInt(conf.min, conf.max);
      arr.push({ a, b, id: `${lv}-${i}-${a}-${b}` });
    }
    return arr;
  }

  function clearRoundState() {
    setPlacedLeft(null);
    setPlacedRight(null);
    setSelectedPiece(null);
    setChoices([]);
    setShowChoices(false);
    setFeedback(null);
    animScale.setValue(0.7);
    animOpacity.setValue(0);
  }

  function startLevel(lv = level) {
    const r = genRoundsForLevel(lv);
    setRounds(r);
    setRoundIndex(0);
    setScore(0);
    clearRoundState();
    setModalVisible(false);
    speak?.(`Nível ${lv}. Vamos começar.`);
  }

  // inicia ao montar e quando level mudar
  useEffect(() => {
    startLevel(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // reseta quando mudamos de rodada
  useEffect(() => {
    clearRoundState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  const currentRound = rounds[roundIndex] || null;

  // formata face (fruit ou number)
  function renderFace(value, type) {
    if (type === 'fruit') {
      const fruit = cfg.fruit || '🍎';
      return repeatEmoji(fruit, value);
    }
    if (type === 'number') return String(value);
    return String(value);
  }

  // piece type por nível (aqui os 3 primeiros são fruta, últimos números)
  function pieceTypeFor() {
    return cfg.mode === 'fruit-fruit' ? 'fruit' : 'number';
  }

  // preparar alternativas depois de ambos os slots preenchidos
  function prepareChoicesAndShow() {
    if (!currentRound) return;
    if (!placedLeft || !placedRight) return;
    const sum = Number(placedLeft.count) + Number(placedRight.count);
    const numericChoices = makeChoices(sum, 4);
    const answerStyle = cfg.mode === 'fruit-fruit' ? 'fruit' : 'number';
    const visualChoices = numericChoices.map((n) => ({
      value: n,
      face: answerStyle === 'fruit' ? renderFace(n, 'fruit') : String(n),
    }));
    setChoices(visualChoices);
    setShowChoices(true);
  }

  useEffect(() => {
    if (placedLeft && placedRight) prepareChoicesAndShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedLeft, placedRight]);

  function onChooseAlternative(choiceValue) {
    const correct = Number(placedLeft.count) + Number(placedRight.count);
    const isCorrect = Number(choiceValue) === correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    speak?.(isCorrect ? 'Acertou' : 'Errou');
    if (isCorrect) setScore((s) => s + 1);

    Animated.parallel([
      Animated.timing(animOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(animScale, { toValue: 1.06, duration: 220, useNativeDriver: true }),
        Animated.spring(animScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

    setTimeout(() => {
      const next = roundIndex + 1;
      if (next >= ROUNDS_PER_LEVEL) {
        setModalVisible(true);
      } else {
        setRoundIndex(next);
        clearRoundState();
      }
    }, 900);
  }

  // colocar peça no slot (tap-to-place). Peças A/B representam os operandos do round
  function placeSelectedPieceOn(slot) {
    if (!selectedPiece) {
      speak?.('Selecione primeiro uma peça.');
      return;
    }
    if (!currentRound) return;
    const Acount = currentRound.a;
    const Bcount = currentRound.b;

    function makeObjFor(piece) {
      const cnt = piece === 'A' ? Acount : Bcount;
      if (pieceTypeFor() === 'fruit') return { face: renderFace(cnt, 'fruit'), count: cnt };
      return { face: String(cnt), count: cnt };
    }

    if (slot === 'left') {
      if (placedLeft) {
        speak?.('Slot da esquerda já ocupado.');
        return;
      }
      setPlacedLeft(makeObjFor(selectedPiece));
    } else {
      if (placedRight) {
        speak?.('Slot da direita já ocupado.');
        return;
      }
      setPlacedRight(makeObjFor(selectedPiece));
    }
    setSelectedPiece(null);
  }

  function onNextLevel() {
    const next = Math.min(maxLevel, level + 1);
    setLevel(next);
    startLevel(next);
  }
  function onReplayLevel() {
    startLevel(level);
  }

  // sizing
  const screen = Dimensions.get('window');
  const SLOT_W = Math.min(160, Math.floor(screen.width * 0.36));
  const SLOT_H = 110;

  // render das escolhas
  function renderChoicesPanel() {
    if (!showChoices || choices.length === 0) return null;
    const correctSum = (placedLeft?.count || 0) + (placedRight?.count || 0);
    return (
      <View style={styles.choicesWrapper}>
        {choices.map((c, idx) => {
          const isCorrect = Number(c.value) === correctSum;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.choiceBtn,
                feedback === 'correct' && isCorrect ? styles.choiceCorrect : null,
                feedback === 'wrong' && !isCorrect ? styles.choiceWrong : null,
              ]}
              onPress={() => onChooseAlternative(c.value)}
            >
              <Text style={styles.choiceText}>{c.face}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Image source={{ uri: TITLE_IMAGE }} style={styles.titleImg} resizeMode="contain" />
      <Text style={styles.heading}>Quebra-cabeça de Contas — Nível {level}</Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Rodada {roundIndex + 1} / {ROUNDS_PER_LEVEL}</Text>
        <Text style={styles.progressText}>Pontuação: {score}</Text>
      </View>

      <View style={styles.slotsRow}>
        <TouchableOpacity
          style={[styles.slot, { width: SLOT_W, height: SLOT_H }, placedLeft ? styles.slotFilled : null]}
          onPress={() => placeSelectedPieceOn('left')}
        >
          <Text style={styles.slotLabel}>{placedLeft ? placedLeft.face : 'Toque aqui'}</Text>
        </TouchableOpacity>

        <View style={styles.operatorBox}>
          <Text style={styles.operator}>+</Text>
          <Text style={[styles.operator, { marginLeft: 12 }]}>=</Text>
        </View>

        <TouchableOpacity
          style={[styles.slot, { width: SLOT_W, height: SLOT_H }, placedRight ? styles.slotFilled : null]}
          onPress={() => placeSelectedPieceOn('right')}
        >
          <Text style={styles.slotLabel}>{placedRight ? placedRight.face : 'Toque aqui'}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.resultArea, { transform: [{ scale: animScale }], opacity: animOpacity }]}>
        <Text style={styles.resultBig}>
          {placedLeft && placedRight ? (cfg.mode === 'fruit-fruit' ? renderFace(placedLeft.count + placedRight.count, 'fruit') : String(placedLeft.count + placedRight.count)) : ' '}
        </Text>
      </Animated.View>

      <View style={styles.piecesRow}>
        <TouchableOpacity onPress={() => setSelectedPiece('A')} style={[styles.piece, selectedPiece === 'A' ? styles.pieceSelected : null]}>
          <Text style={styles.pieceFace}>{currentRound ? renderFace(currentRound.a, pieceTypeFor()) : '-'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedPiece('B')} style={[styles.piece, selectedPiece === 'B' ? styles.pieceSelected : null]}>
          <Text style={styles.pieceFace}>{currentRound ? renderFace(currentRound.b, pieceTypeFor()) : '-'}</Text>
        </TouchableOpacity>
      </View>

      {renderChoicesPanel()}

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.btn} onPress={() => { clearRoundState(); }}>
          <Text style={styles.btnText}>Limpar peça</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { marginLeft: 12 }]} onPress={() => startLevel(level)}>
          <Text style={styles.btnText}>Reiniciar nível</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Fim do nível {level}</Text>
            <Text style={styles.modalSubtitle}>Pontuação: {score} / {ROUNDS_PER_LEVEL}</Text>

            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              {level < maxLevel ? (
                <TouchableOpacity style={[styles.modalBtn, { marginRight: 8 }]} onPress={() => { setModalVisible(false); onNextLevel(); }}>
                  <Text style={styles.modalBtnText}>Próximo nível</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.modalBtn} onPress={() => { setModalVisible(false); onReplayLevel(); }}>
                <Text style={styles.modalBtnText}>Repetir nível</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: '#FFFDF7' },
  titleImg: { width: '68%', height: 72, alignSelf: 'center', marginBottom: 6 },
  heading: { fontSize: 20, fontWeight: '800', color: '#4A90E2', textAlign: 'center', marginBottom: 8 },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 6 },
  progressText: { fontWeight: '800', color: '#444' },

  slotsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 6 },
  slot: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  slotFilled: { backgroundColor: '#cdebb0' },
  slotLabel: { color: '#333', fontWeight: '900', fontSize: 20 },

  operatorBox: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  operator: { fontSize: 30, fontWeight: '900', color: '#333' },

  resultArea: { alignItems: 'center', marginTop: 16, marginBottom: 8, minHeight: 48 },
  resultBig: { fontSize: 26, fontWeight: '900', color: '#333' },

  piecesRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingHorizontal: 12 },
  piece: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', padding: 12, width: 150, height: 110 },
  pieceSelected: { borderColor: '#ffb84d', borderWidth: 3, backgroundColor: '#fff8e6' },
  pieceFace: { fontSize: 26, fontWeight: '900' },

  choicesWrapper: { marginTop: 14, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
  choiceBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: '#eee', margin: 6, minWidth: 110, alignItems: 'center' },
  choiceText: { fontSize: 20, fontWeight: '900' },
  choiceCorrect: { backgroundColor: '#cdebb0', borderColor: '#9ac86f' },
  choiceWrong: { backgroundColor: '#ffd6d6', borderColor: '#ff9a9a' },

  controlsRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'center' },
  btn: { backgroundColor: '#6C63FF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '92%', backgroundColor: '#fffefc', borderRadius: 14, padding: 18, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#333' },
  modalSubtitle: { fontSize: 18, marginTop: 8, color: '#555' },
  modalBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
  modalBtnText: { color: '#fff', fontWeight: '800' },
});
