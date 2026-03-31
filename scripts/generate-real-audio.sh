#!/bin/bash
#
# Generate real audio assets for Recurring World game.
# Replaces placeholder silence MP3s with synthesized chiptune-style audio.
#
# Uses ffmpeg's lavfi audio sources (sine, aevalsrc) to create:
# - BGM: loopable melodic sequences
# - SFX: short one-shot sound effects
# - Ambient: loopable atmospheric layers
#
# All output: 128kbps 44.1kHz stereo MP3

set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/audio"

echo "Generating real audio assets in: $BASE_DIR"

# Ensure directories exist
mkdir -p "$BASE_DIR/bgm" "$BASE_DIR/sfx" "$BASE_DIR/ambient"

# Helper: generate MP3 from ffmpeg args
gen() {
  local out="$1"
  shift
  ffmpeg -y -loglevel error "$@" "$BASE_DIR/$out"
  echo "  Generated: $out ($(stat -c%s "$BASE_DIR/$out") bytes)"
}

# Helper: generate MP3 from aevalsrc expression (uses single quotes to protect shell)
gen_eval() {
  local out="$1"
  local expr="$2"
  local dur="$3"
  local af_chain="${4:-volume=0.8}"
  ffmpeg -y -loglevel error \
    -f lavfi -i "aevalsrc=${expr}:s=44100:d=${dur}" \
    -af "${af_chain}" \
    -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 \
    "$BASE_DIR/$out"
  echo "  Generated: $out ($(stat -c%s "$BASE_DIR/$out") bytes)"
}

###############################################################################
# BGM: Title Theme (~30s loopable chiptune melody)
###############################################################################
echo "=== BGM ==="

# Title theme: warm pentatonic layers over bass drone
gen_eval "bgm/title-theme.mp3" \
  '0.15*sin(2*PI*130.81*t)+0.12*sin(2*PI*261.63*t)*(0.5+0.5*sin(0.25*PI*t))+0.10*sin(2*PI*329.63*t)*(0.5+0.5*sin(0.5*PI*t+1))+0.08*sin(2*PI*392.00*t)*(0.5+0.5*sin(PI*t+2))+0.06*sin(2*PI*523.25*t)*(0.5+0.5*sin(0.75*PI*t+0.5))+0.04*sin(2*PI*659.25*t)*(0.5+0.5*sin(1.5*PI*t+1.5))' \
  30 \
  "volume=0.8,highpass=f=80,lowpass=f=8000"

# Outdoor theme: brighter, more layers, busier feel
gen_eval "bgm/outdoor-theme.mp3" \
  '0.12*sin(2*PI*146.83*t)+0.10*sin(2*PI*293.66*t)*(0.5+0.5*sin(2*PI*t))+0.09*sin(2*PI*349.23*t)*(0.5+0.5*sin(3*PI*t+0.5))+0.08*sin(2*PI*440.00*t)*(0.5+0.5*sin(4*PI*t+1))+0.07*sin(2*PI*523.25*t)*(0.5+0.5*sin(2.5*PI*t+1.5))+0.05*sin(2*PI*659.25*t)*(0.5+0.5*sin(5*PI*t+2))+0.04*sin(2*PI*196.00*t)*(0.5+0.5*sin(8*PI*t))' \
  30 \
  "volume=0.7,highpass=f=100,lowpass=f=7000"

# Interior theme: calm, mellow, fewer layers
gen_eval "bgm/interior-theme.mp3" \
  '0.12*sin(2*PI*110.00*t)+0.10*sin(2*PI*220.00*t)*(0.5+0.5*sin(0.2*PI*t))+0.08*sin(2*PI*277.18*t)*(0.5+0.5*sin(0.3*PI*t+1))+0.06*sin(2*PI*329.63*t)*(0.5+0.5*sin(0.4*PI*t+2))+0.05*sin(2*PI*440.00*t)*(0.5+0.5*sin(0.15*PI*t+0.5))' \
  30 \
  "volume=0.7,highpass=f=60,lowpass=f=6000"

###############################################################################
# SFX: Short one-shot sounds (chiptune style)
# For multi-note SFX, use multiple sine sources + adelay + amix
###############################################################################
echo "=== SFX ==="

# Footstep: short thud — low-frequency burst with fast decay
gen_eval "sfx/footstep.mp3" \
  '0.6*sin(2*PI*80*t)*exp(-30*t)+0.3*sin(2*PI*120*t)*exp(-40*t)' \
  0.12 \
  "volume=0.9,highpass=f=40,lowpass=f=4000"

# Door open: ascending sweep with resonance
gen_eval "sfx/door-open.mp3" \
  '0.4*sin(2*PI*(200+800*t)*t)*exp(-3*t)+0.2*sin(2*PI*(400+600*t)*t)*exp(-4*t)' \
  0.4 \
  "volume=0.8,highpass=f=100,lowpass=f=6000"

# Door close: descending thud
gen_eval "sfx/door-close.mp3" \
  '0.5*sin(2*PI*(500-300*t)*t)*exp(-5*t)+0.3*sin(2*PI*100*t)*exp(-8*t)' \
  0.35 \
  "volume=0.8,highpass=f=60,lowpass=f=5000"

# NPC chime: two-tone ping (note1 at t=0, note2 at 80ms delay)
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=880:duration=0.3" \
  -f lavfi -i "sine=frequency=1108.73:duration=0.22" \
  -filter_complex "[0]volume=0.4,afade=t=out:st=0.05:d=0.25[a];[1]volume=0.4,adelay=80|80,afade=t=out:st=0.1:d=0.2[b];[a][b]amix=inputs=2:duration=longest,highpass=f=200,lowpass=f=8000" \
  -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 \
  "$BASE_DIR/sfx/npc-chime.mp3"
echo "  Generated: sfx/npc-chime.mp3 ($(stat -c%s "$BASE_DIR/sfx/npc-chime.mp3") bytes)"

# Menu open: ascending three-note arpeggio (C5-E5-G5)
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=523.25:duration=0.2" \
  -f lavfi -i "sine=frequency=659.25:duration=0.15" \
  -f lavfi -i "sine=frequency=783.99:duration=0.1" \
  -filter_complex "[0]volume=0.3,afade=t=out:st=0.02:d=0.18[a];[1]volume=0.3,adelay=50|50,afade=t=out:st=0.07:d=0.13[b];[2]volume=0.3,adelay=100|100,afade=t=out:st=0.12:d=0.08[c];[a][b][c]amix=inputs=3:duration=longest,highpass=f=200,lowpass=f=8000" \
  -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 \
  "$BASE_DIR/sfx/menu-open.mp3"
echo "  Generated: sfx/menu-open.mp3 ($(stat -c%s "$BASE_DIR/sfx/menu-open.mp3") bytes)"

# Menu close: descending three-note arpeggio (G5-E5-C5)
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=783.99:duration=0.2" \
  -f lavfi -i "sine=frequency=659.25:duration=0.15" \
  -f lavfi -i "sine=frequency=523.25:duration=0.1" \
  -filter_complex "[0]volume=0.3,afade=t=out:st=0.02:d=0.18[a];[1]volume=0.3,adelay=50|50,afade=t=out:st=0.07:d=0.13[b];[2]volume=0.3,adelay=100|100,afade=t=out:st=0.12:d=0.08[c];[a][b][c]amix=inputs=3:duration=longest,highpass=f=200,lowpass=f=8000" \
  -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 \
  "$BASE_DIR/sfx/menu-close.mp3"
echo "  Generated: sfx/menu-close.mp3 ($(stat -c%s "$BASE_DIR/sfx/menu-close.mp3") bytes)"

# Dialogue tick: tiny click/blip
gen_eval "sfx/dialogue-tick.mp3" \
  '0.5*sin(2*PI*1000*t)*exp(-50*t)' \
  0.06 \
  "volume=0.6,highpass=f=300,lowpass=f=8000"

# Item collected: four-note ascending jingle (C5-E5-G5-C6)
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=523.25:duration=0.35" \
  -f lavfi -i "sine=frequency=659.25:duration=0.29" \
  -f lavfi -i "sine=frequency=783.99:duration=0.23" \
  -f lavfi -i "sine=frequency=1046.50:duration=0.25" \
  -filter_complex "[0]volume=0.35,afade=t=out:st=0.05:d=0.3[a];[1]volume=0.35,adelay=60|60,afade=t=out:st=0.1:d=0.25[b];[2]volume=0.35,adelay=120|120,afade=t=out:st=0.15:d=0.2[c];[3]volume=0.35,adelay=180|180,afade=t=out:st=0.2:d=0.2[d];[a][b][c][d]amix=inputs=4:duration=longest,highpass=f=200,lowpass=f=8000" \
  -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 \
  "$BASE_DIR/sfx/item-collected.mp3"
echo "  Generated: sfx/item-collected.mp3 ($(stat -c%s "$BASE_DIR/sfx/item-collected.mp3") bytes)"

# Quest complete: triumphant six-note fanfare (C5-E5-G5 then C6+E6+G6 chord)
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=523.25:duration=0.9" \
  -f lavfi -i "sine=frequency=659.25:duration=0.8" \
  -f lavfi -i "sine=frequency=783.99:duration=0.7" \
  -f lavfi -i "sine=frequency=1046.50:duration=0.7" \
  -f lavfi -i "sine=frequency=1318.51:duration=0.7" \
  -f lavfi -i "sine=frequency=1567.98:duration=0.7" \
  -filter_complex "\
[0]volume=0.25,afade=t=out:st=0.1:d=0.8[a];\
[1]volume=0.25,adelay=100|100,afade=t=out:st=0.2:d=0.7[b];\
[2]volume=0.25,adelay=200|200,afade=t=out:st=0.3:d=0.6[c];\
[3]volume=0.20,adelay=350|350,afade=t=out:st=0.4:d=0.6[d];\
[4]volume=0.15,adelay=350|350,afade=t=out:st=0.4:d=0.6[e];\
[5]volume=0.15,adelay=350|350,afade=t=out:st=0.4:d=0.6[f];\
[a][b][c][d][e][f]amix=inputs=6:duration=longest,highpass=f=200,lowpass=f=8000" \
  -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 \
  "$BASE_DIR/sfx/quest-complete.mp3"
echo "  Generated: sfx/quest-complete.mp3 ($(stat -c%s "$BASE_DIR/sfx/quest-complete.mp3") bytes)"

###############################################################################
# Ambient: Loopable atmospheric layers
###############################################################################
echo "=== Ambient ==="

# City base: urban hum — low rumble with slow modulation
gen_eval "ambient/city-base.mp3" \
  '0.08*sin(2*PI*55*t)+0.05*sin(2*PI*82.41*t+sin(0.1*PI*t))+0.04*sin(2*PI*110*t)*(0.3+0.7*sin(0.05*PI*t))+0.02*sin(2*PI*220*t)*(0.2+0.8*sin(0.08*PI*t+1))+0.03*sin(2*PI*330*t*sin(0.02*PI*t))*0.3' \
  20 \
  "volume=0.9,highpass=f=30,lowpass=f=3000"

# Cubbon Park: nature sounds — wind-like modulation with bird-like trills
gen_eval "ambient/cubbon-park.mp3" \
  '0.06*sin(2*PI*200*t*sin(0.3*PI*t))*(0.3+0.7*sin(0.1*PI*t))+0.04*sin(2*PI*2000*t)*(0.5+0.5*sin(2.5*PI*t))*(0.5+0.5*sin(0.4*PI*t))+0.03*sin(2*PI*2800*t)*(0.5+0.5*sin(2*PI*t+1))*(0.5+0.5*sin(0.32*PI*t+0.5))+0.03*sin(2*PI*3200*t)*(0.5+0.5*sin(3.5*PI*t+2))*(0.5+0.5*sin(0.55*PI*t+1))+0.04*sin(2*PI*80*t+2*sin(0.5*PI*t))+0.03*sin(2*PI*120*t+3*sin(0.3*PI*t))' \
  20 \
  "volume=0.8,highpass=f=50,lowpass=f=6000"

# Metro interior: mechanical hum with rhythmic modulation
gen_eval "ambient/metro-interior.mp3" \
  '0.10*sin(2*PI*60*t)+0.06*sin(2*PI*120*t+sin(0.5*PI*t))+0.04*sin(2*PI*180*t)*(0.5+0.5*sin(2*PI*t))+0.03*sin(2*PI*300*t)*(0.5+0.5*sin(4.2*PI*t))*(0.5+0.5*sin(0.67*PI*t))+0.02*sin(2*PI*440*t)*(0.3+0.7*sin(0.15*PI*t))' \
  20 \
  "volume=0.8,highpass=f=40,lowpass=f=4000"

# Shop interior: warm indoor ambience — soft pad-like tones
gen_eval "ambient/shop-interior.mp3" \
  '0.06*sin(2*PI*65.41*t)+0.05*sin(2*PI*130.81*t+sin(0.08*PI*t))+0.03*sin(2*PI*196.00*t)*(0.4+0.6*sin(0.06*PI*t))+0.02*sin(2*PI*261.63*t)*(0.3+0.7*sin(0.04*PI*t+1))' \
  20 \
  "volume=0.8,highpass=f=40,lowpass=f=4000"

###############################################################################
echo ""
echo "=== Summary ==="
echo "All audio files generated. Sizes:"
find "$BASE_DIR" -name "*.mp3" -printf "  %p (%s bytes)\n" | sort
echo ""
echo "Done!"
