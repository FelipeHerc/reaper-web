 
function tableToJson(tbl, indent)
    if not indent then indent = 0 end
    local str = ""
    local indent_str = string.rep("  ", indent)

    if type(tbl) == "table" then
        str = str .. "{\n"
        local first = true
        for k, v in pairs(tbl) do
            if not first then str = str .. ",\n" end
            str = str .. indent_str .. "  \"" .. tostring(k) .. "\": " .. tableToJson(v, indent + 1)
            first = false
        end
        str = str .. "\n" .. indent_str .. "}"
    elseif type(tbl) == "string" then
        str = str .. "\"" .. tbl .. "\""
    elseif type(tbl) == "boolean" then
        str = str .. (tbl and "true" or "false")
    else
        str = str .. tostring(tbl)
    end

    return str
end


function GetSendVolume(track_idx, send_idx)
    track = reaper.GetTrack(0, track_idx);

    -- Obter o valor do volume do send (em dB)
    local b, dest_track = reaper.GetTrackSendName(track, send_idx)
    local volume = reaper.GetTrackSendInfo_Value(track, 0, send_idx, "D_VOL")

    -- Converter de dB para escala linear (0-1)
    --if volume ~= 0 then
        --volume = 10^(volume/20)
    --else
        --volume = 0
    --end

    a, trackName = reaper.GetTrackName(track)


    -- reaper.ShowConsoleMsg(string.format("%s => %s: %s \n", trackName, dest_track, volume))

    return string.format("%.4f", volume)
end

function GetSendMute(track_idx, send_idx)
    track = reaper.GetTrack(0, track_idx)
    local mute = reaper.GetTrackSendInfo_Value(track, 0, send_idx, "B_MUTE")
    return mute > 0.5 and 1 or 0
end

-- Obtém o índice da track de destino para um send (usa Herc Guitarra como referência)
function GetOutputTrackIndex(send_idx)
  local src_track = reaper.GetTrack(0, 1)  -- Herc Guitarra (track 1)
  if not src_track then return nil end
  local dest_track = reaper.GetTrackSendInfo_Value(src_track, 0, send_idx, "P_DESTTRACK")
  if not dest_track then return nil end
  local n = reaper.CountTracks(0)
  for i = 0, n - 1 do
    if reaper.GetTrack(0, i) == dest_track then
      return i
    end
  end
  return nil
end

function GetTrackVolume(track_idx)
    local track = reaper.GetTrack(0, track_idx)
    if not track then return "1.0000" end
    local vol = reaper.GetMediaTrackInfo_Value(track, "D_VOL")
    return string.format("%.4f", vol)
end

local volumes = {}
local mutes = {}
local track_volumes = {}

local tracks = {}
tracks["Herc Guitarra"] = 1
tracks["Herc Vocal"] = 2
tracks["Chris"] = 3
tracks["Caio Baixo"] = 4
tracks["Caio Vocal"] = 5
tracks["Bruno Teclado"] = 6
tracks["Bruno Guitarra"] = 7
tracks["Bruno Vocal"] = 8
tracks["Rogerio"] = 9
tracks["Metronome"] = 17
tracks["Sample"] = 18


local outs = {
  Pedro = 0,
  Herc = 1,
  Chris = 2,
  Caio = 3,
  Bruno = 4,
  Rogerio = 5,
  Laney = 6,
  Amp = 7,
  Woofer = 8,
  PA = 9
}


for out_name, out_value in pairs(outs) do
  volumes[out_name] = {}
  mutes[out_name] = {}
  for track_name, track_value in pairs(tracks) do
    volumes[out_name][track_name] = GetSendVolume(track_value, out_value)
    mutes[out_name][track_name] = GetSendMute(track_value, out_value)
  end
end

-- Obtém índice e volume de cada output dinamicamente
local output_track_indices = {}
for out_name, out_value in pairs(outs) do
  local idx = GetOutputTrackIndex(out_value)
  if idx and idx > 0 then
    output_track_indices[out_name] = idx
    track_volumes[out_name] = GetTrackVolume(idx)
  else
    track_volumes[out_name] = "1.0000"
    -- não define índice quando não encontrar (evita controlar Master)
  end
end

local output = { volumes = volumes, mutes = mutes, trackVolumes = track_volumes, trackIndices = output_track_indices }
local json = tableToJson(output)
-- reaper.ShowConsoleMsg(json)
local file = io.open("C:\\Users\\hercr\\AppData\\Roaming\\REAPER\\reaper_www_root\\temp_output.json", "w")

file:write(json)
file:close()

