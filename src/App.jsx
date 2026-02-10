import React, { useEffect, useState } from "react";
import axios from "axios";
import { Slider, Flex, Tabs } from "antd";
import "./App.css";

// URL base do Reaper - carregada de config.json (editável após o build)
const getConfigUrl = () => {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}config.json`;
};

function App() {
  const [reaperUrl, setReaperUrl] = useState(null);
  const [configError, setConfigError] = useState(null);

  // Carrega config.json na inicialização. Em dev, usa /reaper (proxy do Vite evita CORS)
  useEffect(() => {
    if (import.meta.env.DEV) {
      setReaperUrl('/reaper');
      return;
    }
    fetch(getConfigUrl())
      .then((r) => r.json())
      .then((config) => setReaperUrl(config.reaperUrl || "http://localhost:8082"))
      .catch((err) => {
        setConfigError(err.message);
        setReaperUrl("http://localhost:8082"); // fallback
      });
  }, []);

  // Carrega dados da aba Herc ao iniciar (defaultActiveKey)
  useEffect(() => {
    if (reaperUrl) {
      setSelectedOutput(1);
      handleChangeOutput("Herc");
    }
  }, [reaperUrl]);

  // Escala logarítmica: -90 dB a +12 dB, 0 dB (value=1) em 75% do slider
  const DB_MIN = -90;
  const DB_MAX = 12;
  const VALUE_MIN = 0.00003; // ~-90 dB
  const POS_0DB = 75; // 0 dB em 75% do slider

  const linearToDb = (linear) => {
    if (linear <= 0.00001) return -Infinity;
    return 20 * Math.log10(linear);
  };

  // Valor linear (0-4) -> posição do slider (0-100)
  const valueToSliderPos = (value) => {
    if (value <= 0) return 0;
    const db = Math.max(DB_MIN, 20 * Math.log10(Math.max(value, VALUE_MIN)));
    if (db <= 0) return Math.round((db - DB_MIN) / (-DB_MIN) * POS_0DB);
    return Math.round(POS_0DB + (100 - POS_0DB) * (db / DB_MAX));
  };

  // Posição do slider (0-100) -> valor linear (0-4)
  const sliderPosToValue = (pos) => {
    if (pos <= 0) return VALUE_MIN;
    let db;
    if (pos <= POS_0DB) {
      db = DB_MIN + (pos / POS_0DB) * (-DB_MIN);
    } else {
      db = ((pos - POS_0DB) / (100 - POS_0DB)) * DB_MAX;
    }
    return Math.min(4, Math.pow(10, db / 20));
  };
  
  const outputs = [
    { index: 1, name: "Herc", color: "#e74c3c" },
    { index: 2, name: "Chris", color: "#3498db" },
    { index: 3, name: "Caio", color: "#f1c40f" },
    { index: 4, name: "Bruno", color: "#ecf0f1" },
    { index: 5, name: "Rogerio", color: "#2ecc71" },
    { index: 6, name: "Laney", color: "#e67e22" },
    { index: 7, name: "Amp", color: "#9b59b6" },
    { index: 8, name: "Woofer", color: "#1abc9c" },
  ];

  const tabLabel = (name, color) => (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 4,
        backgroundColor: color || "rgba(255,255,255,0.1)",
        color: color ? "#141414" : undefined,
      }}
    >
      {name}
    </span>
  );
  
  
  const [volHerc, setVolHerc] = useState(0.5)
  const [volHercVocal, setVolHercVocal] = useState(0.5)
  const [volChris, setVolChris] = useState(0.5)
  const [volCaio, setVolCaio] = useState(0.5)
  const [volCaioVocal, setVolCaioVocal] = useState(0.5)
  const [volBruno, setVolBruno] = useState(0.5)
  const [volBrunoGuitarra, setVolBrunoGuitarra] = useState(0.5)
  const [volRogerio, setVolRogerio] = useState(0.5)
  const [volMetronomo, setVolMetronomo] = useState(0.5)
  const [volSamples, setVolSamples] = useState(0.5)

  const [selectedOutput, setSelectedOutput] = useState(null)
  
  const UPDATE_JSON_ACTION = "_RS7d161cd8b6903e0e8165e59fb8f141967daf27a6";

  const handleVolumeChange = (sendTrackId, newVolume) => {
    if (!reaperUrl || !selectedOutput) return;
    const url = `${reaperUrl}/_/SET/TRACK/${sendTrackId}/SEND/${selectedOutput}/VOL/${newVolume}`;
    axios.get(url).catch((err) => console.error("Erro ao enviar volume:", err));
  };

  const handleChangeOutput = (key) => {
    const output = outputs.find((x) => x.name === key);
    if (!output || !reaperUrl) return;

    // Chama a action do Reaper para atualizar o temp_output.json, depois lê o arquivo
    axios
      .get(`${reaperUrl}/_/${UPDATE_JSON_ACTION}`)
      .then(() => new Promise(r => setTimeout(r, 150)))
      .then(() => axios.get(`${reaperUrl}/temp_output.json?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } }))
      .then((response) => {
        const json = response.data;
        const parse = (v) => parseFloat(v) || 0;
        const data = json[output.name] || {};
        setVolHerc(parse(data["Herc Guitarra"]))
        setVolHercVocal(parse(data["Herc Vocal"]))
        setVolChris(parse(data["Chris"]))
        setVolCaio(parse(data["Caio Baixo"]))
        setVolCaioVocal(parse(data["Caio Vocal"]))
        setVolBruno(parse(data["Bruno Teclado"]))
        setVolBrunoGuitarra(parse(data["Bruno Guitarra"]))
        setVolRogerio(parse(data["Rogerio"]))
        setVolMetronomo(parse(data["Metronome"]))
        setVolSamples(parse(data["Sample"]))
      })
      .catch((err) => console.error("Erro ao carregar preset:", err));
  };

  const knob = (label, value, callback, color) => {
    const sliderPos = valueToSliderPos(value);
    return (
      <Flex justify="center" align="center" style={{ width: '100%' }}>
        <Flex flex={3} justify="center" align="center">
          <label>{label}</label>
        </Flex>
        <Flex flex={6} justify="center" align="center" style={{ position: 'relative', width: '100%', '--slider-color': color }} className="slider-colored">
          <Slider
            style={{ flex: 'auto' }}
            min={0}
            max={100}
            value={sliderPos}
            onChange={(pos) => callback(sliderPosToValue(pos))}
            trackStyle={{ backgroundColor: color }}
          />
          <div
            style={{
              position: 'absolute',
              left: '75%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 2,
              height: 16,
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: 1,
              pointerEvents: 'none',
              zIndex: 1,
            }}
            title="0 dB"
          />
        </Flex>
        <Flex flex={3} justify="center" align="center">
          {linearToDb(value) === -Infinity ? '-∞' : linearToDb(value).toFixed(2)} dB
        </Flex>
      </Flex>
    );
  };


  if (!reaperUrl) {
    return (
      <Flex vertical justify="center" align="center" style={{ padding: "3%" }}>
        Carregando configuração...
      </Flex>
    );
  }

  return (
    <Flex vertical justify="center" align="center" style={{padding: '3%'}}>
      {configError && (
        <div style={{ color: "orange", marginBottom: 8 }}>
          config.json não encontrado, usando fallback (localhost:8082)
        </div>
      )}
      <Tabs
        defaultActiveKey="Herc"
        style={{ width: '100%' }}
        onChange={(key) => {
          const output = outputs.find((x) => x.name === key);
          if (output) setSelectedOutput(output.index);
          handleChangeOutput(key);
        }}
        items={outputs.map(({ name, color }) => ({
            key: name,
            label: tabLabel(name, color),
            children: (
              <Flex vertical gap={8}>
                {knob('Herc', volHerc, (e) => { setVolHerc(parseFloat(e)); handleVolumeChange(2, parseFloat(e)); }, '#e74c3c')}
                {knob('Herc Vocal', volHercVocal, (e) => { setVolHercVocal(parseFloat(e)); handleVolumeChange(3, parseFloat(e)); }, '#e74c3c')}
                {knob('Chris', volChris, (e) => { setVolChris(parseFloat(e)); handleVolumeChange(4, parseFloat(e)); }, '#3498db')}
                {knob('Caio', volCaio, (e) => { setVolCaio(parseFloat(e)); handleVolumeChange(5, parseFloat(e)); }, '#f1c40f')}
                {knob('Caio Vocal', volCaioVocal, (e) => { setVolCaioVocal(parseFloat(e)); handleVolumeChange(6, parseFloat(e)); }, '#f1c40f')}
                {knob('Bruno', volBruno, (e) => { setVolBruno(parseFloat(e)); handleVolumeChange(7, parseFloat(e)); }, '#ecf0f1')}
                {knob('Bruno Guitarra', volBrunoGuitarra, (e) => { setVolBrunoGuitarra(parseFloat(e)); handleVolumeChange(8, parseFloat(e)); }, '#ecf0f1')}
                {knob('Rogério', volRogerio, (e) => { setVolRogerio(parseFloat(e)); handleVolumeChange(9, parseFloat(e)); }, '#2ecc71')}
                {knob('Metronomo', volMetronomo, (e) => { setVolMetronomo(parseFloat(e)); handleVolumeChange(17, parseFloat(e)); }, '#95a5a6')}
                {knob('Samples', volSamples, (e) => { setVolSamples(parseFloat(e)); handleVolumeChange(18, parseFloat(e)); }, '#95a5a6')}
              </Flex>
            ),
          }))}
      />
    </Flex>
  );
}

export default App;
