import React, { useEffect, useState } from "react";
import axios from "axios";
import { Slider, Flex, Tabs, Button } from "antd";

const IconSpeaker = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);
const IconSpeakerMuted = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);
import "./App.css";

// URL base do Reaper - carregada de config.json (editável após o build)
const getConfigUrl = () => {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}config.json`;
};

function App() {
  const [reaperUrl, setReaperUrl] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [flipBrunoFxAction, setFlipBrunoFxAction] = useState("_RS8c41baad8b3ad08bc468aae8f6c34bbee8969166");
  
  // Carrega config.json na inicialização. Em dev, usa /reaper (proxy do Vite evita CORS)
  useEffect(() => {
    if (import.meta.env.DEV) {
      setReaperUrl('/reaper');
      return;
    }
    fetch(getConfigUrl())
      .then((r) => r.json())
      .then((config) => {
        setReaperUrl(config.reaperUrl || "http://localhost:8082");
        // setFlipBrunoFxAction(config.flipBrunoFxAction || null);
      })
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
    { index: 9, name: "PA", color: "#f39c12" },
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
  const [volBrunoVocal, setVolBrunoVocal] = useState(0.5)
  const [volRogerio, setVolRogerio] = useState(0.5)
  const [volMetronomo, setVolMetronomo] = useState(0.5)
  const [volSamples, setVolSamples] = useState(0.5)

  const [muteHerc, setMuteHerc] = useState(false)
  const [muteHercVocal, setMuteHercVocal] = useState(false)
  const [muteChris, setMuteChris] = useState(false)
  const [muteCaio, setMuteCaio] = useState(false)
  const [muteCaioVocal, setMuteCaioVocal] = useState(false)
  const [muteBruno, setMuteBruno] = useState(false)
  const [muteBrunoGuitarra, setMuteBrunoGuitarra] = useState(false)
  const [muteBrunoVocal, setMuteBrunoVocal] = useState(false)
  const [muteRogerio, setMuteRogerio] = useState(false)
  const [muteMetronomo, setMuteMetronomo] = useState(false)
  const [muteSamples, setMuteSamples] = useState(false)

  const [selectedOutput, setSelectedOutput] = useState(null)
  const [volOutTrack, setVolOutTrack] = useState(1)
  const [trackIndices, setTrackIndices] = useState({})

  const UPDATE_JSON_ACTION = "_RS7d161cd8b6903e0e8165e59fb8f141967daf27a6";

  const handleVolumeChange = (sendTrackId, newVolume) => {
    if (!reaperUrl || !selectedOutput) return;
    const url = `${reaperUrl}/_/SET/TRACK/${sendTrackId}/SEND/${selectedOutput}/VOL/${newVolume}`;
    axios.get(url).catch((err) => console.error("Erro ao enviar volume:", err));
  };

  const handleTrackVolumeChange = (trackIndex, newVolume) => {
    if (!reaperUrl || trackIndex == null || trackIndex === undefined) return;
    // API do Reaper usa índices 1-based para SET/TRACK (0=Master, 1=primeira track)
    const apiIndex = trackIndex + 1;
    const url = `${reaperUrl}/_/SET/TRACK/${apiIndex}/VOL/${newVolume}`;
    axios.get(url).catch((err) => console.error("Erro ao enviar volume da track:", err));
  };

  const handleMuteToggle = (sendTrackId, currentMute, setMute) => {
    if (!reaperUrl || !selectedOutput) return;
    const newMute = !currentMute;
    setMute(newMute);
    const url = `${reaperUrl}/_/SET/TRACK/${sendTrackId}/SEND/${selectedOutput}/MUTE/${newMute ? 1 : 0}`;
    axios.get(url).catch((err) => console.error("Erro ao mutar:", err));
  };

  const handleFlipBrunoGuitarraFx = () => {
    if (!reaperUrl || !flipBrunoFxAction) return;
    axios.get(`${reaperUrl}/_/${flipBrunoFxAction}`).catch((err) => console.error("Erro ao flip FX:", err));
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
        const parseMute = (v) => (parseInt(v, 10) || 0) !== 0;
        // Suporta novo formato { volumes, mutes } e antigo { Herc: {...} }
        const volData = json.volumes?.[output.name] ?? json[output.name] ?? {};
        const muteData = json.mutes?.[output.name] ?? {};
        setVolHerc(parse(volData["Herc Guitarra"]))
        setVolHercVocal(parse(volData["Herc Vocal"]))
        setVolChris(parse(volData["Chris"]))
        setVolCaio(parse(volData["Caio Baixo"]))
        setVolCaioVocal(parse(volData["Caio Vocal"]))
        setVolBruno(parse(volData["Bruno Teclado"]))
        setVolBrunoGuitarra(parse(volData["Bruno Guitarra"]))
        setVolBrunoVocal(parse(volData["Bruno Vocal"]))
        setVolRogerio(parse(volData["Rogerio"]))
        setVolMetronomo(parse(volData["Metronome"]))
        setVolSamples(parse(volData["Sample"]))
        setMuteHerc(parseMute(muteData["Herc Guitarra"]))
        setMuteHercVocal(parseMute(muteData["Herc Vocal"]))
        setMuteChris(parseMute(muteData["Chris"]))
        setMuteCaio(parseMute(muteData["Caio Baixo"]))
        setMuteCaioVocal(parseMute(muteData["Caio Vocal"]))
        setMuteBruno(parseMute(muteData["Bruno Teclado"]))
        setMuteBrunoGuitarra(parseMute(muteData["Bruno Guitarra"]))
        setMuteBrunoVocal(parseMute(muteData["Bruno Vocal"]))
        setMuteRogerio(parseMute(muteData["Rogerio"]))
        setMuteMetronomo(parseMute(muteData["Metronome"]))
        setMuteSamples(parseMute(muteData["Sample"]))
        const trackVol = json.trackVolumes?.[output.name];
        setVolOutTrack(parse(trackVol) || 1)
        setTrackIndices((prev) => ({
          ...prev,
          ...(json.trackIndices || {}),
        }))
      })
      .catch((err) => console.error("Erro ao carregar preset:", err));
  };

  const trackRow = (label, value, onVolume, color) => {
    const sliderPos = valueToSliderPos(value);
    return (
      <Flex justify="center" align="center" style={{ width: '100%' }} gap={8}>
        <Flex flex={2} justify="center" align="center" style={{ paddingRight: 8 }}>
          <label>{label}</label>
        </Flex>
        <Flex flex={6} justify="center" align="center" style={{ position: 'relative', width: '100%', '--slider-color': color }} className="slider-colored">
          <Slider
            style={{ flex: 'auto' }}
            min={0}
            max={100}
            value={sliderPos}
            onChange={(pos) => onVolume(sliderPosToValue(pos))}
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
        <Flex flex={2} justify="center" align="center">
          {linearToDb(value) === -Infinity ? '-∞' : linearToDb(value).toFixed(2)} dB
        </Flex>
      </Flex>
    );
  };

  const row = (label, value, onVolume, mute, onMute, color) => {
    const sliderPos = valueToSliderPos(value);
    return (
      <Flex justify="center" align="center" style={{ width: '100%' }} gap={8}>
        <span
          className="mute-icon"
          onClick={() => onMute()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onMute()}
          title={mute ? 'Desmutar' : 'Mutar'}
          style={{
            flexShrink: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: mute ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)',
          }}
        >
          {mute ? <IconSpeakerMuted /> : <IconSpeaker />}
        </span>
        <Flex flex={2} justify="center" align="center">
          <label style={{ opacity: mute ? 0.5 : 1 }}>{label}</label>
        </Flex>
        <Flex flex={6} justify="center" align="center" style={{ position: 'relative', width: '100%', '--slider-color': color, opacity: mute ? 0.5 : 1 }} className="slider-colored">
          <Slider
            style={{ flex: 'auto' }}
            min={0}
            max={100}
            value={sliderPos}
            onChange={(pos) => onVolume(sliderPosToValue(pos))}
            trackStyle={{ backgroundColor: color }}
            disabled={mute}
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
        <Flex flex={2} justify="center" align="center">
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
                {trackRow(`Track ${name}`, volOutTrack, (e) => { setVolOutTrack(parseFloat(e)); handleTrackVolumeChange(trackIndices[name], parseFloat(e)); }, color)}
                {name === 'Bruno' && flipBrunoFxAction && (
                  <Flex justify="center" style={{ marginTop: 4 }}>
                    <Button size="small" onClick={handleFlipBrunoGuitarraFx}>Flip FX</Button>
                  </Flex>
                )}
                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />
                {row('Herc', volHerc, (e) => { setVolHerc(parseFloat(e)); handleVolumeChange(2, parseFloat(e)); }, muteHerc, () => handleMuteToggle(2, muteHerc, setMuteHerc), '#e74c3c')}
                {row('Herc Vocal', volHercVocal, (e) => { setVolHercVocal(parseFloat(e)); handleVolumeChange(3, parseFloat(e)); }, muteHercVocal, () => handleMuteToggle(3, muteHercVocal, setMuteHercVocal), '#e74c3c')}
                {row('Chris', volChris, (e) => { setVolChris(parseFloat(e)); handleVolumeChange(4, parseFloat(e)); }, muteChris, () => handleMuteToggle(4, muteChris, setMuteChris), '#3498db')}
                {row('Caio', volCaio, (e) => { setVolCaio(parseFloat(e)); handleVolumeChange(5, parseFloat(e)); }, muteCaio, () => handleMuteToggle(5, muteCaio, setMuteCaio), '#f1c40f')}
                {row('Caio Vocal', volCaioVocal, (e) => { setVolCaioVocal(parseFloat(e)); handleVolumeChange(6, parseFloat(e)); }, muteCaioVocal, () => handleMuteToggle(6, muteCaioVocal, setMuteCaioVocal), '#f1c40f')}
                {row('Bruno', volBruno, (e) => { setVolBruno(parseFloat(e)); handleVolumeChange(7, parseFloat(e)); }, muteBruno, () => handleMuteToggle(7, muteBruno, setMuteBruno), '#ecf0f1')}
                {row('Bruno Guitarra', volBrunoGuitarra, (e) => { setVolBrunoGuitarra(parseFloat(e)); handleVolumeChange(8, parseFloat(e)); }, muteBrunoGuitarra, () => handleMuteToggle(8, muteBrunoGuitarra, setMuteBrunoGuitarra), '#ecf0f1')}
                {row('Bruno Vocal', volBrunoVocal, (e) => { setVolBrunoVocal(parseFloat(e)); handleVolumeChange(9, parseFloat(e)); }, muteBrunoVocal, () => handleMuteToggle(9, muteBrunoVocal, setMuteBrunoVocal), '#ffffff')}
                {row('Rogério', volRogerio, (e) => { setVolRogerio(parseFloat(e)); handleVolumeChange(10, parseFloat(e)); }, muteRogerio, () => handleMuteToggle(10, muteRogerio, setMuteRogerio), '#2ecc71')}
                {row('Metronomo', volMetronomo, (e) => { setVolMetronomo(parseFloat(e)); handleVolumeChange(18, parseFloat(e)); }, muteMetronomo, () => handleMuteToggle(18, muteMetronomo, setMuteMetronomo), '#95a5a6')}
                {row('Samples', volSamples, (e) => { setVolSamples(parseFloat(e)); handleVolumeChange(19, parseFloat(e)); }, muteSamples, () => handleMuteToggle(19, muteSamples, setMuteSamples), '#95a5a6')}
              </Flex>
            ),
          }))}
      />
    </Flex>
  );
}

export default App;
