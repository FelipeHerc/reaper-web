import React, { useEffect, useState } from "react";
import axios from "axios";
import { Slider, Flex, Select } from "antd";

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
  
  const handleVolumeChange = (sendTrackId, newVolume) => {
    if (!reaperUrl) return;
    const url = `${reaperUrl}/_/SET/TRACK/${sendTrackId}/SEND/${selectedOutput}/VOL/${newVolume}`;
    axios
      .get(url)
      .catch((err) => console.error("Erro ao enviar volume:", err));
  };

  const handleChangeOutput = (e) => {
    console.log(e);
    axios.get('temp_output.json').then(response => {
      console.log(response);
      console.log(response.data);
      
      const json = response.data
      const output = outputs.find(x => x.name.includes(e))
      setSelectedOutput(output.index)
      console.log(json);
      
      console.log(json[output.name]);
      console.log(json[output.name]["Herc Guitarra"]);
  
      console.log(json[output.name]["Herc Guitarra"])
      console.log(json[output.name]["Herc Vocal"])
      console.log(json[output.name]["Chris"])
      console.log(json[output.name]["Caio Baixo"])
      console.log(json[output.name]["Caio Vocal"])
      console.log(json[output.name]["Bruno Teclado"])
      console.log(json[output.name]["Bruno Guitarra"])
      console.log(json[output.name]["Rogerio"])
      console.log(json[output.name]["Metronome"])
      console.log(json[output.name]["Sample"])
  
  
  
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
  }


  useEffect(() => {
    if (!reaperUrl) return;
    axios.get(`${reaperUrl}/_/_RS9b151125a0eecbe8c0fe277e70df395e52f5f593`);
  }, [reaperUrl]);

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
      {/* {knob('teste', volHerc, (e) => { setVolHerc(parseFloat((e))); handleVolumeChange(2, (parseFloat(e)))}) } */}

      {
        !selectedOutput &&
        <Select name="" id="" placeholder="Selecione seu canal" onChange={handleChangeOutput} style={{width: '80%'}}>
          <option value="Herc">Herc</option>
          <option value="Chris">Chris</option>
          <option value="Caio">Caio</option>
          <option value="Bruno">Bruno</option>
          <option value="Rogerio">Rogerio</option>

        </Select>
      }

      {selectedOutput && knob('Herc', volHerc, (e) => { setVolHerc(parseFloat((e))); handleVolumeChange(2, (parseFloat(e)))}) }
      {selectedOutput && knob('Herc Vocal', volHercVocal, (e) => { setVolHercVocal(parseFloat((e))); handleVolumeChange(3, (parseFloat(e)))}) }
      {selectedOutput && knob('Chris', volChris, (e) => { setVolChris(parseFloat((e))); handleVolumeChange(4, (parseFloat(e)))}) }
      {selectedOutput && knob('Caio', volCaio, (e) => { setVolCaio(parseFloat((e))); handleVolumeChange(5, (parseFloat(e)))}) }
      {selectedOutput && knob('Caio Vocal', volCaioVocal, (e) => { setVolCaioVocal(parseFloat((e))); handleVolumeChange(6, (parseFloat(e)))}) }
      {selectedOutput && knob('Bruno', volBruno, (e) => { setVolBruno(parseFloat((e))); handleVolumeChange(7, (parseFloat(e)))}) }
      {selectedOutput && knob('Bruno Guitarra', volBrunoGuitarra, (e) => { setVolBrunoGuitarra(parseFloat((e))); handleVolumeChange(8, (parseFloat(e)))}) }
      {selectedOutput && knob('Rogério', volRogerio, (e) => { setVolRogerio(parseFloat((e))); handleVolumeChange(9, (parseFloat(e)))}) }
      {selectedOutput && knob('Metronomo', volMetronomo, (e) => { setVolMetronomo(parseFloat((e))); handleVolumeChange(18, (parseFloat(e)))}) }
      {selectedOutput && knob('Samples', volSamples, (e) => { setVolSamples(parseFloat((e))); handleVolumeChange(19, (parseFloat(e)))}) }



    </Flex>
  );
}

export default App;
