 
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

local volumes = {}

local tracks = {}
tracks["Herc Guitarra"] = 1
tracks["Herc Vocal"] = 2
tracks["Chris"] = 3
tracks["Caio Baixo"] = 4
tracks["Caio Vocal"] = 5
tracks["Bruno Teclado"] = 6
tracks["Bruno Guitarra"] = 7
tracks["Rogerio"] = 8
tracks["Metronome"] = 17
tracks["Sample"] = 18


local outs = {
  Pedro = 0,
  Herc = 1,
  Chris = 2,
  Caio = 3,
  Bruno = 4,
  Rogerio = 5
}


for out_name, out_value in pairs(outs) do
  volumes[out_name] = {}
  for track_name, track_value in pairs(tracks) do
    volumes[out_name][track_name] = GetSendVolume(track_value, out_value)
  end
end


local json = tableToJson(volumes)
reaper.ShowConsoleMsg(json)
local file = io.open("C:\\Users\\hercr\\AppData\\Roaming\\REAPER\\reaper_www_root\\temp_output.json", "w")

file:write(json)
file:close()

