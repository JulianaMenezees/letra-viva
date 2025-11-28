// QuebraCabecaNiveis.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import useTTS from '../utils/useTTS';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from "expo-speech";

// habilita LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// título (arquivo que você enviou)
const TITLE_IMAGE = '/mnt/data/A_2D_digital_graphic_features_the_word_"Dominó"_sp.png';

// imagem de parabéns (declare uma vez, no topo)
const CONGRATS_IMAGE = require("../assets/images/jogos/cacaPalavras/check.png");

// Helpers
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// chunk helper
function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

/**
 * makeChoices revisada:
 * garante presença do correto e variedade ao redor.
 */
function makeChoices(correct, count = 4) {
  const spread = Math.max(2, Math.floor(Math.abs(correct) * 0.4) + 1);
  const minCandidate = Math.max(0, correct - spread * 2);
  const maxCandidate = correct + spread * 2;

  const pool = [];
  for (let n = minCandidate; n <= maxCandidate; n++) pool.push(n);
  if (!pool.includes(correct)) pool.push(correct);
  shuffleArray(pool);

  const picks = new Set([correct]);
  let idx = 0;
  while (picks.size < count && idx < pool.length) {
    picks.add(pool[idx]);
    idx++;
  }

  let fallbackAttempts = 0;
  while (picks.size < count && fallbackAttempts < 200) {
    const cand = Math.max(0, correct + randInt(-Math.max(1, spread * 2), Math.max(1, spread * 2)));
    picks.add(cand);
    fallbackAttempts++;
  }

  return shuffleArray(Array.from(picks));
}

/**
 * CONFIG: 6 níveis
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
  const { speak } = useTTS ? useTTS() : { speak: () => { } };

  const initialLevel = Number(route?.params?.level) || 1;
  const maxLevel = Object.keys(LEVELS).length;
  const [level, setLevel] = useState(Math.max(1, Math.min(maxLevel, initialLevel)));
  const cfg = LEVELS[level];

  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [score, setScore] = useState(0);

  // sempre auto-place: armazenamos apenas count (número)
  const [placedLeft, setPlacedLeft] = useState(null); // { count: number }
  const [placedRight, setPlacedRight] = useState(null);

  // escolhas / feedback
  const [choices, setChoices] = useState([]);
  const [showChoices, setShowChoices] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct'|'wrong'|null
  const [selectedChoiceValue, setSelectedChoiceValue] = useState(null);

  // animação resultado
  const animScale = useRef(new Animated.Value(0.7)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  // modal simples de parabéns
  const [showCongrats, setShowCongrats] = useState(false);

  // resultados por rodada
  const [roundResults, setRoundResults] = useState([]); // array de { a,b,op,result,chosen,isCorrect }

  // chave usada para salvar progresso global dos módulos/níveis
  const PROGRESS_KEY = 'quebra_cabeca_progress_global';

  async function saveLevelComplete(lvl) {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      let data;
      try { data = raw ? JSON.parse(raw) : { completed: [] }; } catch (e) { data = { completed: [] }; }

      const completedRaw = Array.isArray(data.completed) ? data.completed : [];
      const completedNums = completedRaw.map((v) => Number(v)).filter((n) => Number.isFinite(n));

      if (!completedNums.includes(lvl)) {
        const newCompleted = [...completedNums, lvl]
          .filter((v, i, a) => a.indexOf(v) === i) // unique
          .sort((a, b) => a - b);

        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: newCompleted }));
        console.log('[saveLevelComplete] salvo', PROGRESS_KEY, newCompleted);
      }
    } catch (err) {
      console.error('[saveLevelComplete] erro ao salvar progresso', err);
    }
  }

  function genRoundsForLevel(lv) {
    const conf = LEVELS[lv];
    const arr = [];
    const usedResults = new Set();
    let attempts = 0;
    const maxAttempts = 1000;

    while (arr.length < ROUNDS_PER_LEVEL && attempts < maxAttempts) {
      attempts++;
      let a = randInt(conf.min, conf.max);
      let b = randInt(conf.min, conf.max);

      let operator = '+';
      if (lv >= 4) operator = Math.random() < 0.4 ? '-' : '+';

      if (operator === '-' && a < b) [a, b] = [b, a];

      const result = operator === '+' ? a + b : Math.max(0, a - b);

      if (usedResults.has(result)) continue;

      usedResults.add(result);
      arr.push({ a, b, operator, id: `${lv}-${arr.length}-${a}-${b}-${operator}` });
    }

    while (arr.length < ROUNDS_PER_LEVEL) {
      const a = randInt(conf.min, conf.max);
      const b = randInt(conf.min, conf.max);
      const operator = '+';
      arr.push({ a, b, operator, id: `${lv}-fallback-${arr.length}-${a}-${b}-${operator}` });
    }

    return arr;
  }

  function clearRoundState() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlacedLeft(null);
    setPlacedRight(null);
    setChoices([]);
    setShowChoices(false);
    setFeedback(null);
    setSelectedChoiceValue(null);
    animScale.setValue(0.7);
    animOpacity.setValue(0);
  }

  function startLevel(lv = level) {
    const r = genRoundsForLevel(lv);
    setRounds(r);
    setRoundIndex(0);
    setScore(0);
    setRoundResults([]);
    clearRoundState();
    setShowCongrats(false);
    // speak?.(`Nível ${lv}. Vamos começar.`);
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

  // efeito que fecha o modal de parabéns e faz speak + volta
  useEffect(() => {
    if (showCongrats) {
      speak?.('Parabéns! Você concluiu o nível.');

      const timer = setTimeout(() => {
        setShowCongrats(false);
        navigation.goBack();
      }, 4000); // 4s

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCongrats]);

  const currentRound = rounds[roundIndex] || null;

  /**
   * renderFace agora retorna um objeto:
   *  { text: string (pode conter \n), fontSize: number }
   *
   * Para 'fruit' quebra em linhas (CHUNK_SIZE por linha) e calcula fontSize baseado na quantidade.
   * Para 'number' retorna o número como texto e fontSize padrão.
   */
  function renderFaceValue(value, type) {
    if (type === 'fruit') {
      const fruit = cfg.fruit || '🍎';
      const count = Math.max(0, Number(value) || 0);

      // decide quantas frutas por linha (experimente 2,3,4)
      const CHUNK_SIZE = 3;
      const emojis = Array.from({ length: count }).map(() => fruit);
      const lines = chunkArray(emojis, CHUNK_SIZE).map(lineArr => lineArr.join(' '));
      const text = lines.length > 0 ? lines.join('\n') : '';

      // fontSize dinâmico (ajuste conservador)
      // base pequena para 0..1, sobe com mais itens
      const fontSize = Math.max(14, Math.min(44, 18 + Math.floor(count * 1.6)));

      return { text, fontSize };
    }

    // number
    return { text: String(value), fontSize: 34 };
  }

  function pieceTypeFor() {
    return cfg.mode === 'fruit-fruit' ? 'fruit' : 'number';
  }

  // Sempre true: todos os níveis são "olhar a resposta"
  const autoPlaceThisLevel = true;

  // preparar alternativas depois de ambos os slots preenchidos (ou auto-placed)
  function prepareChoicesAndShow() {
    if (!currentRound) return;  top: 
    if (!placedLeft || !placedRight) return;

    const a = Number(placedLeft.count);
    const b = Number(placedRight.count);
    const op = currentRound.operator || '+';
    const result = op === '+' ? a + b : Math.max(0, a - b);

    const numericChoices = makeChoices(result, 4);
    const visualChoices = numericChoices.map((n) => ({ value: n, face: String(n) }));
    setChoices(visualChoices);
    setShowChoices(true);
  }

  // auto-place sempre (todos os níveis) — agora colocamos só counts
  useEffect(() => {
    if (!currentRound) return;

    const op = currentRound.operator || '+';
    let A = currentRound.a;
    let B = currentRound.b;
    if (op === '-' && A < B) [A, B] = [B, A];

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlacedLeft({ count: A });
    setPlacedRight({ count: B });

    setTimeout(() => {
      prepareChoicesAndShow();
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  useEffect(() => {
    if (placedLeft && placedRight) prepareChoicesAndShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedLeft, placedRight]);

  function onChooseAlternative(choiceValue) {
    if (feedback !== null) return;

    const a = Number(placedLeft.count);
    const b = Number(placedRight.count);
    const op = currentRound.operator || '+';
    const result = op === '+' ? a + b : Math.max(0, a - b);

    const chosenNum = Number(choiceValue);
    const isCorrect = chosenNum === result;

    // registra resultado da rodada
    setRoundResults(prev => [...prev, {
      id: currentRound?.id || `${level}-${roundIndex}`,
      a, b, op, result, chosen: chosenNum, isCorrect
    }]);

    setSelectedChoiceValue(chosenNum);
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

    const FEEDBACK_DURATION = isCorrect ? 1600 : 2000;
    setTimeout(() => {
      const next = roundIndex + 1;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      if (next >= ROUNDS_PER_LEVEL) {
        // salva progresso (não precisa aguardar)
        saveLevelComplete(level).catch(() => { /* já logamos erros internamente */ });

        // fim do nível: mostramos o modal simples (useEffect vai falar e voltar)
        setShowCongrats(true);
      } else {
        setRoundIndex(next);
        clearRoundState();
      }

    }, FEEDBACK_DURATION);
  }

  function onNextLevel() {
    const next = Math.min(maxLevel, level + 1);
    setLevel(next);
    startLevel(next);
  }
  function onReplayLevel() {
    startLevel(level);
  }

  const screen = Dimensions.get('window');
  const SLOT_W = Math.min(160, Math.floor(screen.width * 0.36));
  const SLOT_H = 110;

  function renderChoicesPanel() {
    if (!showChoices || choices.length === 0) return null;
    const op = currentRound?.operator || '+';
    const correctVal = op === '+' ? (placedLeft?.count || 0) + (placedRight?.count || 0) : Math.max(0, (placedLeft?.count || 0) - (placedRight?.count || 0));

    return (
      <View style={styles.choicesWrapper}>
        {choices.map((c, idx) => {
          const isCorrectChoice = Number(c.value) === correctVal;
          const chosenByUser = selectedChoiceValue !== null && Number(c.value) === Number(selectedChoiceValue);

          const btnStyles = [styles.choiceBtn];
          if (feedback !== null) {
            if (feedback === 'correct' && chosenByUser && isCorrectChoice) {
              btnStyles.push(styles.choiceCorrect);
            } else if (feedback === 'wrong') {
              if (chosenByUser && !isCorrectChoice) {
                btnStyles.push(styles.choiceWrong);
              }
              if (isCorrectChoice) {
                btnStyles.push(styles.choiceCorrect);
              }
            }
          }

          // Decide cor do texto explicitamente
          let textColor = '#2b2f36'; // sua cor neutra
          if (feedback !== null) {
            if (isCorrectChoice) {
              // alternativa correta — manter destaque mas texto ainda pode ser neutro ou escuro
              textColor = '#2b2f36';
            }
            if (chosenByUser && !isCorrectChoice) {
              // usuário escolheu errado -> deixar o texto contrastado também
              textColor = '#2b2f36';
            }
          }

          // Caso queira que texto branco apareça sobre fundos escuros, substitua textColor quando necessário:
          // if (btnStyles.includes(styles.choiceCorrect)) textColor = '#2b2f36';
          // if (btnStyles.includes(styles.choiceWrong)) textColor = '#2b2f36';

          return (
            <TouchableOpacity
              key={idx}
              style={btnStyles}
              onPress={() => onChooseAlternative(c.value)}
              disabled={feedback !== null}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.choiceText,
                  { color: textColor } // força a cor sempre aqui
                ]}
                allowFontScaling={false}
              >
                {c.face}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }


  function getSlotHeight(count) {
    if (!count || count <= 0) return 110;

    // cada linha tem CHUNK_SIZE frutas
    const CHUNK_SIZE = 3;
    const lines = Math.ceil(count / CHUNK_SIZE);

    // 40px por linha + padding
    return Math.max(110, 40 * lines + 20);
  }

  const leftH = getSlotHeight(placedLeft?.count);
  const rightH = getSlotHeight(placedRight?.count);
  const SLOT_DYNAMIC_H = Math.max(leftH, rightH);

  return (
    <View style={styles.outer}>
      {/* header */}
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

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: TITLE_IMAGE }} style={styles.titleImg} resizeMode="contain" />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => speak(`Nível ${level}`)}
              style={styles.heroButton}
            >
              <View style={[styles.heroCircle, { width: 110, height: 110, borderRadius: 60, transform: [{ translateX: -75 }] }]}>
                <Text style={[styles.heroNumber, { fontSize: 38 }]}>{level}</Text>
              </View>
            </TouchableOpacity>


            {/* ÁUDIO: 2 botões lado a lado */}
            {/* ÁUDIO: 2 botões lado a lado */}
            {/* ÁUDIO: 2 botões lado a lado */}
            <View style={styles.audioContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  speak?.(
                    `  Você abriu o nível ${level}. Olhe as quantidades nos dois quadradinhos em verde, depois olha a operação, se é soma, ou , subtração e marque a alternativa correta, nos quadradinhos abaixo`
                  )
                }
                style={styles.audioButton}
                accessibilityLabel="Botão de áudio"
              >
                <Text style={styles.audioIcon}>🔊</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Speech.stop()}
                style={styles.muteButton}
                accessibilityLabel="Parar fala"
              >
                <Text style={styles.muteIcon}>🔇</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* main */}
      <View style={styles.cardsWrapper}>
        <View style={styles.progressRowSmall} />

        <View style={styles.slotsRow}>
          <View style={[styles.slot, { width: SLOT_W, height: SLOT_DYNAMIC_H }, placedRight && styles.slotFilled]}>
            {placedLeft ? (
              (() => {
                const face = pieceTypeFor() === 'fruit' ? renderFaceValue(placedLeft.count, 'fruit') : renderFaceValue(placedLeft.count, 'number');
                return (
                  <Text style={[styles.slotLabel, { fontSize: face.fontSize }]} allowFontScaling numberOfLines={3}>
                    {face.text}
                  </Text>
                );
              })()
            ) : (
              <Text style={styles.slotLabel}>-</Text>
            )}
          </View>

          <View style={[styles.operatorBox, { height: SLOT_DYNAMIC_H }]}>
            <Text style={styles.operator}>{currentRound?.operator || '+'}</Text>
            <Text style={[styles.operator, styles.equals]}>=</Text>
          </View>

          <View style={[styles.slot, { width: SLOT_W, minHeight: SLOT_H }, placedRight ? styles.slotFilled : null]}>
            {placedRight ? (
              (() => {
                const face = pieceTypeFor() === 'fruit' ? renderFaceValue(placedRight.count, 'fruit') : renderFaceValue(placedRight.count, 'number');
                return (
                  <Text style={[styles.slotLabel, { fontSize: face.fontSize }]} allowFontScaling numberOfLines={3}>
                    {face.text}
                  </Text>
                );
              })()
            ) : (
              <Text style={styles.slotLabel}>-</Text>
            )}
          </View>
        </View>

        <Animated.View style={[styles.resultArea, { transform: [{ scale: animScale }], opacity: animOpacity }]}>
          {placedLeft && placedRight ? (() => {
            const resultValue = currentRound?.operator === '-' ?
              Math.max(0, (placedLeft.count || 0) - (placedRight.count || 0)) :
              (placedLeft.count || 0) + (placedRight.count || 0);

            const face = cfg.mode === 'fruit-fruit'
              ? renderFaceValue(resultValue, 'fruit')
              : renderFaceValue(resultValue, 'number');

            return (
              <Text style={[styles.resultBig, { fontSize: face.fontSize }]} allowFontScaling>
                {face.text}
              </Text>
            );
          })() : <Text style={styles.resultBig}> </Text>}
        </Animated.View>

        {renderChoicesPanel()}

      </View>

      {/* modal simples de "Parabéns" */}
      <Modal visible={showCongrats} animationType="fade" transparent>
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

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#FFFDF7' },

  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 48,
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
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  titleImg: { width: 74, height: 56, resizeMode: 'contain' },
  heading: { fontSize: 18, fontWeight: '800', color: '#4A90E2' },
  subheading: { fontSize: 12, color: '#666' },

  heroButton: { alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  heroCircle: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF6F7', borderWidth: 1, borderColor: 'rgba(236,112,122,0.14)' },
  heroNumber: { color: '#ec707a', fontWeight: '900', textAlign: 'center' },

  speakerButton: { width: 44, height: 44, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', elevation: 3 },
  speakerEmoji: { fontSize: 18 },

  cardsWrapper: {
    width: '98%',
    alignSelf: 'center',
    backgroundColor: '#fff7ee',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    flexShrink: 1,
    margin: 12,
    marginTop: 70,
  },

  progressRowSmall: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontWeight: '800', color: '#444' },

  slotsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 6 },
  slot: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', padding: 8 },
  slotFilled: { backgroundColor: '#cdebb0' },
  slotLabel: { color: '#333', fontWeight: '900', fontSize: 20, textAlign: 'center', includeFontPadding: false },

  operatorBox: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  operator: { fontSize: 30, fontWeight: '900', color: '#333' },

  resultArea: { alignItems: 'center', marginTop: 16, marginBottom: 8, minHeight: 48 },
  resultBig: { fontSize: 26, fontWeight: '900', color: '#333', textAlign: 'center', includeFontPadding: false },

  choicesWrapper: { marginTop: 14, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
  choiceBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: '#eee', margin: 6, minWidth: 110, alignItems: 'center' },
  choiceText: { fontSize: 20, fontWeight: '900', color: '#6b6f76' },
  choiceCorrect: { backgroundColor: '#cdebb0', borderColor: '#9ac86f' },
  choiceWrong: { backgroundColor: '#ffd6d6', borderColor: '#ff9a9a' },

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
    height: 140,
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
    marginBottom: 4,
    textAlign: 'center',
  },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  starEmoji: { fontSize: 26, marginRight: 6, lineHeight: 30 },
  starEmojiFilled: { color: '#FFD24D' },
  starEmojiEmpty: { color: '#C4C4C4' },

  operatorBox: {
    width: 60,                 // largura fixa confortável para operador + '='
    alignItems: 'center',      // centraliza horizontalmente
    justifyContent: 'center',  // centraliza verticalmente (agora o height vem do SLOT_DYNAMIC_H)
    paddingHorizontal: 6,
  },
  operator: {
    fontSize: 34,
    fontWeight: '900',
    color: '#6b6f76',
    includeFontPadding: false, // remove padding vertical extra da fonte (melhora centralização)
    lineHeight: 36,            // certifique que seja próximo ao fontSize + 2
    textAlign: 'center',
  },
  equals: {
    marginTop: 4,              // leve ajuste para ficar esteticamente separado; ajuste se quiser
    fontSize: 28,
    lineHeight: 30,
  },

  /* --- ÁUDIO (botões) --- */
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -75
  },

  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    top: 2
  },

  audioIcon: {
    fontSize: 28,
  },

  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    top: 6
  },

  muteIcon: {
    fontSize: 25,
  },


});


