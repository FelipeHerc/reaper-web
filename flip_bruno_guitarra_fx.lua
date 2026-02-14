-- Flip FX 0 e FX 1 na track "Bruno Guitarra"
-- Desliga o que está ligado e liga o que está desligado

local track_name = "Bruno Guitarra"
local n = reaper.CountTracks(0)

for i = 0, n - 1 do
  local tr = reaper.GetTrack(0, i)
  local ok, name = reaper.GetSetMediaTrackInfo_String(tr, "P_NAME", "", false)
  if ok and name == track_name then
    local en0 = reaper.TrackFX_GetEnabled(tr, 0)
    local en1 = reaper.TrackFX_GetEnabled(tr, 1)
    reaper.TrackFX_SetEnabled(tr, 0, not en0)
    reaper.TrackFX_SetEnabled(tr, 1, not en1)
    reaper.TrackList_AdjustWindows(false)
    break
  end
end
