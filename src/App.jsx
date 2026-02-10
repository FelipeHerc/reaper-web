import React, { useEffect, useState } from "react";
import axios from "axios";
import { Slider, Flex, Tabs } from "antd";

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
  const linearToDb = (linear) => {
    if (linear <= 0.00001) return -Infinity;
    return 20 * Math.log10(linear);
  };
  
  const outputs = [
    {index: 1, name: "Herc"},
    {index: 2, name: "Chris"},
    {index: 3, name: "Caio"},
    {index: 4, name: "Bruno"},
    {index: 5, name: "Rogerio"},
  ]
  
  
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
    console.log("handleChangeOutput", key);
    const output = outputs.find((x) => x.name.includes(key));
    console.log("output", output);
    if (!output) return;

    // Chama a action do Reaper para atualizar o temp_output.json, depois lê o arquivo
    axios
      .get(`${reaperUrl}/_/${UPDATE_JSON_ACTION}`)
      .then(() => axios.get(`${reaperUrl}/temp_output.json`))
      .then((response) => {
        const json = response.data;
        setVolHerc(json[output.name]["Herc Guitarra"])
        setVolHercVocal(json[output.name]["Herc Vocal"])
        setVolChris(json[output.name]["Chris"])
        setVolCaio(json[output.name]["Caio Baixo"])
        setVolCaioVocal(json[output.name]["Caio Vocal"])
        setVolBruno(json[output.name]["Bruno Teclado"])
        setVolBrunoGuitarra(json[output.name]["Bruno Guitarra"])
        setVolRogerio(json[output.name]["Rogerio"])
        setVolMetronomo(json[output.name]["Metronome"])
        setVolSamples(json[output.name]["Sample"])
      })
      .catch((err) => console.error("Erro ao carregar preset:", err));
  };

  const knob = (label, value, callback) => {
    return <Flex justify="center" align="center" style={{width: '100%'}}>
        <Flex flex={3} justify="center" align="center">
          <label htmlFor="">
            {label}
          </label>
        </Flex>
        <Flex flex={6} justify="center" align="center">
          <Slider
              style={{ flex: 'auto' }}
              min={0}
              max={4}
              value={value}
              step={0.0001}
              onChange={(e) => callback(e)}
          />
        </Flex>
        <Flex flex={3} justify="center" align="center">{linearToDb(value).toFixed(4)} Db</Flex>
      </Flex>
  }


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
        defaultActiveKey="Master"
        style={{ width: '100%' }}
        onChange={(key) => {
          if (key !== 'Master') {
            const output = outputs.find((x) => x.name === key);
            if (output) setSelectedOutput(output.index);
            handleChangeOutput(key);
          }
        }}
        items={[
          {
            key: 'Master',
            label: 'Master',
            children: (
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            ),
          },
          ...outputs.map(({ name }) => ({
            key: name,
            label: name,
            children: (
              <Flex vertical gap={8}>
                {knob('Herc', volHerc, (e) => { setVolHerc(parseFloat(e)); handleVolumeChange(2, parseFloat(e)); })}
                {knob('Herc Vocal', volHercVocal, (e) => { setVolHercVocal(parseFloat(e)); handleVolumeChange(3, parseFloat(e)); })}
                {knob('Chris', volChris, (e) => { setVolChris(parseFloat(e)); handleVolumeChange(4, parseFloat(e)); })}
                {knob('Caio', volCaio, (e) => { setVolCaio(parseFloat(e)); handleVolumeChange(5, parseFloat(e)); })}
                {knob('Caio Vocal', volCaioVocal, (e) => { setVolCaioVocal(parseFloat(e)); handleVolumeChange(6, parseFloat(e)); })}
                {knob('Bruno', volBruno, (e) => { setVolBruno(parseFloat(e)); handleVolumeChange(7, parseFloat(e)); })}
                {knob('Bruno Guitarra', volBrunoGuitarra, (e) => { setVolBrunoGuitarra(parseFloat(e)); handleVolumeChange(8, parseFloat(e)); })}
                {knob('Rogério', volRogerio, (e) => { setVolRogerio(parseFloat(e)); handleVolumeChange(9, parseFloat(e)); })}
                {knob('Metronomo', volMetronomo, (e) => { setVolMetronomo(parseFloat(e)); handleVolumeChange(18, parseFloat(e)); })}
                {knob('Samples', volSamples, (e) => { setVolSamples(parseFloat(e)); handleVolumeChange(19, parseFloat(e)); })}
              </Flex>
            ),
          })),
        ]}
      />
    </Flex>
  );
}

export default App;
