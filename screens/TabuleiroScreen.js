// MultiGame.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Alert,
  Image,
  TextInput,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: W } = Dimensions.get("window");

/* ========== utils ========== */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ========== config/data ========== */
const PHASES_PER_LEVEL = 4; // 4 fases por nível
const finishStepsDefault = 6;

/* tecnologia */
const TECH_WORDS = [
  { id: 1, resposta: "EMAIL" },
  { id: 2, resposta: "CELULAR" },
  { id: 3, resposta: "INTERNET" },
  { id: 4, resposta: "SENHA" },
  { id: 5, resposta: "WIFI" },
  { id: 6, resposta: "ARQUIVO" },
];

/* portugues */
const PORT_WORDS = [
  { word: "CASA", hintEmoji: "🏠", image: null },
  { word: "GATO", hintEmoji: "🐱", image: null },
  { word: "BOLA", hintEmoji: "⚽", image: null },
  { word: "MESA", hintEmoji: "🪑", image: null },
  { word: "FLOR", hintEmoji: "🌼", image: null },
  { word: "PATO", hintEmoji: "🦆", image: null },
];

/* ========== helper: salva progresso por fase ========== */
async function savePhaseProgress(progressKey = "caca_progress_global", level, phase) {
  try {
    const key = progressKey || "caca_progress_global";
    const raw = await AsyncStorage.getItem(key);
    let data;
    try {
      data = raw ? JSON.parse(raw) : { completed: [] };
    } catch {
      data = { completed: [] };
    }
    const existing = Array.isArray(data.completed) ? data.completed.map(String) : [];

    // normalize old formats (N => N:1..N:PHASES_PER_LEVEL)
    const normalized = existing.flatMap((x) => {
      const s = String(x).trim();
      if (/^\d+$/.test(s)) {
        const lvl = Number(s);
        return Array.from({ length: PHASES_PER_LEVEL }, (_, i) => `${lvl}:${i + 1}`);
      }
      const m = s.match(/(\d+)[^\d]+(\d+)/);
      if (m) return `${Number(m[1])}:${Number(m[2])}`;
      const t = s.match(/L(\d+).*P(\d+)/i);
      if (t) return `${Number(t[1])}:${Number(t[2])}`;
      return null;
    }).filter(Boolean);

    const pair = `${Number(level)}:${Number(phase)}`;
    const next = Array.from(new Set([...normalized, pair])).sort((a, b) => {
      const [la, pa] = a.split(":").map(Number);
      const [lb, pb] = b.split(":").map(Number);
      if (la !== lb) return la - lb;
      return pa - pb;
    });

    await AsyncStorage.setItem(key, JSON.stringify({ completed: next }));
    return next;
  } catch (err) {
    console.error("savePhaseProgress error", err);
    throw err;
  }
}

/* ========== MultiGame (entry) ========== */
export default function MultiGame({ navigation, route, category: propCategory = "matematica", phase: propPhase = 1, onFinish }) {
  const level = Number(route?.params?.level) || 1;
  let phase = Number(route?.params?.phase) || Number(propPhase) || 1;
  if (!Number.isFinite(phase) || phase < 1) phase = 1;
  if (phase > PHASES_PER_LEVEL) phase = PHASES_PER_LEVEL;

  // category may come from route.params.category or propCategory
  const category = route?.params?.category || route?.params?.gameCategory || propCategory || "matematica";

  if (category === "matematica") {
    return <MathRace navigation={navigation} route={route} level={level} phase={phase} onFinish={onFinish} />;
  } else if (category === "portugues") {
    return <PortugueseGame navigation={navigation} route={route} level={level} phase={phase} onFinish={onFinish} />;
  } else if (category === "tecnologia") {
    return <TechGame navigation={navigation} route={route} level={level} phase={phase} onFinish={onFinish} />;
  } else {
    return (
      <SafeAreaView style={styles.safe}><Text>Categoria desconhecida</Text></SafeAreaView>
    );
  }
}

/* ================= MathRace (mantive o seu comportamento) ================= */
function MathRace({ navigation, route, level = 1, phase = 1, onFinish }) {
  const [question, setQuestion] = useState({ a: 2, b: 1, op: "+" });
  const [options, setOptions] = useState([3, 2, 4]);
  const [correct, setCorrect] = useState(3);

  const [playerStep, setPlayerStep] = useState(0);
  const [botStep, setBotStep] = useState(0);
  const playerAnim = useRef(new Animated.Value(0)).current;
  const botAnim = useRef(new Animated.Value(0)).current;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(8);

  const finishSteps = finishStepsDefault;
  const trackWidth = Math.max(160, W - 140);
  const stepPx = Math.floor(trackWidth / finishSteps);

  useEffect(() => {
    newQuestion();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeLeft(8);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question]);

  function newQuestion() {
    const maxNum = Math.min(6 + round + phase * 1, 20);
    const a = randInt(1, Math.max(2, Math.floor(maxNum / 2)));
    const b = randInt(1, Math.max(1, Math.floor(maxNum / 3)));
    const op = Math.random() < 0.8 ? "+" : "-";
    const res = op === "+" ? a + b : Math.max(0, a - b);
    setQuestion({ a, b, op });
    setCorrect(res);

    const setOps = new Set();
    setOps.add(res);
    while (setOps.size < 3) setOps.add(Math.max(0, res + randInt(-3, 4)));
    setOptions(shuffle(Array.from(setOps)));
  }

  function animateTo(anim, toPx, duration = 400) {
    Animated.timing(anim, { toValue: toPx, duration, useNativeDriver: true }).start();
  }

  async function handlePhaseComplete() {
    // salva e volta p/levels (opção 1)
    const lvl = Number(level) || 1;
    const ph = Number(phase) || 1;
    const progressKey = route?.params?.progressKey || "caca_progress_global";
    try { await savePhaseProgress(progressKey, lvl, ph); } catch (e) { console.warn(e); }
    try {
      navigation.navigate("LevelsTabuleiro", { completedLevel: lvl, completedPhase: ph, progressKey });
    } catch (e) { try { navigation.goBack(); } catch (_) {} }
  }

  function onAnswerPress(val) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (val === correct) {
      const next = Math.min(finishSteps, playerStep + 1);
      setPlayerStep(next);
      animateTo(playerAnim, next * stepPx, 350);
      setScore(s => s + 10);
      if (next >= finishSteps) {
        setTimeout(handlePhaseComplete, 420);
        return;
      }
    } else {
      const nb = Math.min(finishSteps, botStep + 1);
      setBotStep(nb);
      animateTo(botAnim, nb * stepPx, randInt(700, 1300));
      if (nb >= finishSteps) {
        Alert.alert("Ops", "O robô venceu", [{ text: "OK", onPress: () => {
          // reset only
          setPlayerStep(0); setBotStep(0); playerAnim.setValue(0); botAnim.setValue(0);
        } }]);
        return;
      }
    }

    setTimeout(() => {
      // bot comportamento leve
      if (Math.random() < 0.5) {
        const nb = Math.min(finishSteps, botStep + (Math.random() < 0.35 ? 1 : 0));
        setBotStep(nb);
        animateTo(botAnim, nb * stepPx, randInt(800, 1400));
      }
      setRound(r => r + 1);
      setTimeout(newQuestion, 380);
    }, 300);
  }

  function onTimeUp() {
    const nb = Math.min(finishSteps, botStep + 1);
    setBotStep(nb);
    animateTo(botAnim, nb * stepPx, randInt(700, 1300));
    if (nb >= finishSteps) {
      Alert.alert("Tempo!", "O robô avançou e venceu", [{ text: "OK" }]);
    } else {
      setRound(r => r + 1);
      setTimeout(newQuestion, 380);
    }
  }

  // inline track styles
  const playerStyle = { transform: [{ translateX: playerAnim }] };
  const botStyle = { transform: [{ translateX: botAnim }] };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Corrida dos Números (Nível {level} — Fase {phase})</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Pontos: {score}</Text>
          <Text style={styles.meta}>Fase interna: {round}</Text>
          <Text style={styles.meta}>Tempo: {timeLeft}s</Text>
        </View>
      </View>

      {/* pista / carros inline */}
      <View style={{ padding: 12, gap: 18, minHeight: 220 }}>
        <View style={{ position: "absolute", right: 20, top: 12, bottom: 12, width: 6, backgroundColor: "#111", opacity: 0.18 }} />

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
          <Text style={{ width: 60, textAlign: "center", fontWeight: "700" }}>ROBÔ</Text>
          <View style={{ flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" }, botStyle]}>
              <View style={[styles.carBody, { backgroundColor: "#ff6b6b" }]} />
            </Animated.View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
          <Text style={{ width: 60, textAlign: "center", fontWeight: "700" }}>VOCÊ</Text>
          <View style={{ flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" }, playerStyle]}>
              <View style={[styles.carBody, { backgroundColor: "#3b82f6" }]} />
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.question}>Resolva: {question.a} {question.op} {question.b} = ?</Text>
        <View style={styles.optionsRow}>
          {options.map((opt, i) => (
            <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => onAnswerPress(opt)}>
              <Text style={styles.optionTxt}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => {
          setPlayerStep(0); setBotStep(0); playerAnim.setValue(0); botAnim.setValue(0); setRound(1); setScore(0); newQuestion();
        }}>
          <Text style={styles.controlTxt}>Reiniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={() => { if (timerRef.current) clearInterval(timerRef.current); onTimeUp(); }}>
          <Text style={styles.controlTxt}>Pular</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= PortugueseGame (integrada com pista) ================= */
function PortugueseGame({ navigation, route, level = 1, phase = 1, onFinish }) {
  const [entry, setEntry] = useState("");
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);

  // track (inline)
  const finishSteps = finishStepsDefault; // usa a const do topo do arquivo (ex: 6)
  const trackWidth = Math.max(160, W - 140);
  const stepPx = Math.floor(trackWidth / finishSteps);
  const playerAnim = useRef(new Animated.Value(0)).current;
  const botAnim = useRef(new Animated.Value(0)).current;
  const [playerStep, setPlayerStep] = useState(0);
  const [botStep, setBotStep] = useState(0);

  useEffect(() => { generate(); }, []);

  function generate() {
    const pool = PORT_WORDS;
    const item = pool[randInt(0, pool.length - 1)];
    const word = item.word.toUpperCase();
    if (phase <= 3) {
      const missingCount = phase === 1 ? 1 : phase === 2 ? randInt(1, 2) : 2;
      const indices = [];
      const letters = word.split("");
      const available = letters.map((_, idx) => idx);
      while (indices.length < missingCount && available.length) {
        const idx = available.splice(randInt(0, available.length - 1), 1)[0];
        if (!indices.includes(idx)) indices.push(idx);
      }
      const masked = letters.map((ch, idx) => (indices.includes(idx) ? "_" : ch)).join(" ");
      setCurrent({ word, hintEmoji: item.hintEmoji, image: item.image ?? null, masked, missingIndexes: indices });
      setEntry("");
    } else {
      setCurrent({ word, hintEmoji: item.hintEmoji, image: item.image ?? null, masked: null, missingIndexes: [] });
      setEntry("");
    }
  }

  function animateTo(anim, toPx, dur = 360) {
    Animated.timing(anim, { toValue: toPx, duration: dur, useNativeDriver: true }).start();
  }

  async function onCorrectFlow() {
    const next = Math.min(finishSteps, playerStep + 1);
    setPlayerStep(next);
    animateTo(playerAnim, next * stepPx, 360);
    setScore(s => s + 10);

    if (next >= finishSteps) {
      const lvl = Number(level) || 1;
      const ph = Number(phase) || 1;
      const progressKey = route?.params?.progressKey || "caca_progress_global";
      try { await savePhaseProgress(progressKey, lvl, ph); } catch (e) { console.warn(e); }
      try { navigation.navigate("LevelsTabuleiro", { completedLevel: lvl, completedPhase: ph, progressKey }); }
      catch (e) { try { navigation.goBack(); } catch (_) {} }
      return;
    }

    setTimeout(generate, 420);
  }

  function check() {
    if (!current) return;
    const answer = entry.trim().toUpperCase();
    if (phase <= 3) {
      const missing = current.missingIndexes.map((idx) => current.word[idx]).join("").toUpperCase();
      if (answer === missing || answer === current.word) {
        Alert.alert("Certo!", "Você acertou!", [{ text: "Continuar", onPress: onCorrectFlow }], { cancelable: false });
      } else {
        const nb = Math.min(finishSteps, botStep + 1);
        setBotStep(nb);
        animateTo(botAnim, nb * stepPx, 420);
        Alert.alert("Errado", `Resposta correta: ${current.word}`, [{ text: "Ok", onPress: generate }], { cancelable: false });
      }
    } else {
      if (answer === current.word) {
        Alert.alert("Certo!", "Você acertou!", [{ text: "Continuar", onPress: onCorrectFlow }], { cancelable: false });
      } else {
        const nb = Math.min(finishSteps, botStep + 1);
        setBotStep(nb);
        animateTo(botAnim, nb * stepPx, 420);
        Alert.alert("Errado", `Resposta correta: ${current.word}`, [{ text: "Ok", onPress: generate }], { cancelable: false });
      }
    }
  }

  // --- inline track JSX (sem componente externo) ---
  const playerStyle = { transform: [{ translateX: playerAnim }] };
  const botStyle = { transform: [{ translateX: botAnim }] };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Português (Nível {level} — Fase {phase})</Text>
        <View style={styles.metaRow}><Text style={styles.meta}>Pontos: {score}</Text></View>
      </View>

      {/* pista / carros (inline) */}
      <View style={{ padding: 12, gap: 18, minHeight: 220 }}>
        <View style={{ position: "absolute", right: 20, top: 12, bottom: 12, width: 6, backgroundColor: "#111", opacity: 0.18 }} />
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
          <Text style={{ width: 60, textAlign: "center", fontWeight: "700" }}>AMIGO</Text>
          <View style={{ flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" }, botStyle]}>
              <View style={[styles.carBody, { backgroundColor: "#ff6b6b" }]} />
            </Animated.View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
          <Text style={{ width: 60, textAlign: "center", fontWeight: "700" }}>VOCÊ</Text>
          <View style={{ flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" }, playerStyle]}>
              <View style={[styles.carBody, { backgroundColor: "#3b82f6" }]} />
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={styles.centerBox}>
        {phase <= 3 ? (
          <>
            <Text style={styles.bigMasked}>{current?.masked ?? ""}</Text>
            <Text style={{ marginTop: 8 }}>Dica: {current?.hintEmoji ?? ""}</Text>
            <TextInput value={entry} onChangeText={setEntry} placeholder={`Digite as letras faltando`} style={styles.input} autoCapitalize="characters" />
            <TouchableOpacity style={styles.okBtn} onPress={check}><Text style={styles.okTxt}>Confirmar</Text></TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.imageBox}>
              {current?.image ? <Image source={current.image} style={styles.previewImage} resizeMode="contain" /> : <Text style={{ fontSize: 48 }}>{current?.hintEmoji ?? "❓"}</Text>}
            </View>

            <Text style={{ marginTop: 8, fontWeight: "700" }}>Escreva o nome do que aparece</Text>
            <TextInput value={entry} onChangeText={setEntry} placeholder={`Digite a palavra completa`} style={styles.input} autoCapitalize="characters" />
            <TouchableOpacity style={styles.okBtn} onPress={check}><Text style={styles.okTxt}>Enviar</Text></TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================= TechGame (integrada com pista) ================= */
function TechGame({ navigation, route, level = 1, phase = 1, onFinish }) {
  const [pool] = useState(TECH_WORDS.map(w => w.resposta));
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);

  // track
  const finishSteps = finishStepsDefault;
  const trackWidth = Math.max(160, W - 140);
  const stepPx = Math.floor(trackWidth / finishSteps);
  const playerAnim = useRef(new Animated.Value(0)).current;
  const botAnim = useRef(new Animated.Value(0)).current;
  const [playerStep, setPlayerStep] = useState(0);
  const [botStep, setBotStep] = useState(0);

  useEffect(() => { generate(); }, []);

  function generate() {
    const correct = pool[randInt(0, pool.length - 1)];
    const optionsCount = phase <= 2 ? 3 : 4;
    const setOps = new Set();
    setOps.add(correct);
    while (setOps.size < optionsCount) setOps.add(pool[randInt(0, pool.length - 1)]);
    setQuestion(correct);
    setOptions(shuffle(Array.from(setOps)));
  }

  function animateTo(anim, toPx, dur = 360) {
    Animated.timing(anim, { toValue: toPx, duration: dur, useNativeDriver: true }).start();
  }

  async function onPick(opt) {
    if (opt === question) {
      const next = Math.min(finishSteps, playerStep + 1);
      setPlayerStep(next);
      animateTo(playerAnim, next * stepPx, 360);
      setScore(s => s + 10);

      if (next >= finishSteps) {
        const lvl = Number(level) || 1;
        const ph = Number(phase) || 1;
        const progressKey = route?.params?.progressKey || "caca_progress_global";
        try { await savePhaseProgress(progressKey, lvl, ph); } catch (e) { console.warn(e); }
        try { navigation.navigate("LevelsTabuleiro", { completedLevel: lvl, completedPhase: ph, progressKey }); }
        catch (e) { try { navigation.goBack(); } catch (_) {} }
        return;
      }

      Alert.alert("Certo!", "Resposta correta", [{ text: "Próxima", onPress: generate }], { cancelable: false });
    } else {
      const nb = Math.min(finishSteps, botStep + 1);
      setBotStep(nb);
      animateTo(botAnim, nb * stepPx, 380);
      Alert.alert("Errado", `A resposta correta é: ${question}`, [{ text: "Próxima", onPress: generate }], { cancelable: false });
    }
  }

  const playerStyle = { transform: [{ translateX: playerAnim }] };
  const botStyle = { transform: [{ translateX: botAnim }] };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Tecnologia (Nível {level} — Fase {phase})</Text>
        <View style={styles.metaRow}><Text style={styles.meta}>Pontos: {score}</Text></View>
      </View>

      {/* pista / carros inline */}
      <View style={{ padding: 12, gap: 18, minHeight: 220 }}>
        <View style={{ position: "absolute", right: 20, top: 12, bottom: 12, width: 6, backgroundColor: "#111", opacity: 0.18 }} />
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
          <Text style={{ width: 60, textAlign: "center", fontWeight: "700" }}>ROBÔ</Text>
          <View style={{ flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" }, botStyle]}>
              <View style={[styles.carBody, { backgroundColor: "#ff6b6b" }]} />
            </Animated.View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
          <Text style={{ width: 60, textAlign: "center", fontWeight: "700" }}>VOCÊ</Text>
          <View style={{ flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" }, playerStyle]}>
              <View style={[styles.carBody, { backgroundColor: "#3b82f6" }]} />
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={styles.centerBox}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Escolha o que corresponde:</Text>

        <View style={{ marginBottom: 16, padding: 12, backgroundColor: "#fff", borderRadius: 8 }}>
          <Text style={{ fontSize: 22, textAlign: "center" }}>Escolha: <Text style={{ fontWeight: "900" }}>{question}</Text></Text>
        </View>

        <View style={{ width: "100%" }}>
          {options.map((opt, i) => (
            <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => onPick(opt)}>
              <Text style={styles.optionTxt}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ================= styles (reaproveitados) ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f9ff" },
  header: { padding: 14, backgroundColor: "#60a5fa", alignItems: "center" },
  title: { fontSize: 20, color: "#fff", fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  meta: { color: "#fff", marginHorizontal: 8 },

  trackWrap: { padding: 12, gap: 18, minHeight: 220 },
  finishLine: { position: "absolute", right: 20, top: 12, bottom: 12, width: 6, backgroundColor: "#111", opacity: 0.2 },
  carRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 6 },
  label: { width: 60, textAlign: "center", fontWeight: "700" },
  track: { flex: 1, height: 84, borderRadius: 12, backgroundColor: "#e6f2ff", overflow: "hidden", justifyContent: "center" },
  car: { position: "absolute", left: 12, width: 96, height: 72, alignItems: "center", justifyContent: "center" },
  carBody: { width: 64, height: 36, borderRadius: 8, elevation: 6 },

  questionBox: { padding: 16, marginTop: 8, backgroundColor: "#fff", marginHorizontal: 12, borderRadius: 12, elevation: 3 },
  question: { fontSize: 20, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  optionsRow: { flexDirection: "row", justifyContent: "space-around" },
  optionBtn: { backgroundColor: "#fde68a", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, minWidth: 90, alignItems: "center", elevation: 2, marginVertical: 6, marginHorizontal: 8 },
  optionTxt: { fontSize: 18, fontWeight: "800" },

  controls: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  controlBtn: { backgroundColor: "#60a5fa", padding: 12, borderRadius: 10, minWidth: 120, alignItems: "center" },
  controlTxt: { color: "#fff", fontWeight: "700" },

  centerBox: { padding: 18, alignItems: "center" },
  bigMasked: { fontSize: 36, letterSpacing: 4, fontWeight: "800" },
  input: { width: "86%", borderColor: "#ccc", borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 12, backgroundColor: "#fff" },
  okBtn: { marginTop: 12, backgroundColor: "#34d399", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  okTxt: { color: "#fff", fontWeight: "700" },

  imageBox: { width: 160, height: 160, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 12, elevation: 3 },
  previewImage: { width: 140, height: 140 },

  titleSmall: { fontSize: 16, fontWeight: "700" },
});
