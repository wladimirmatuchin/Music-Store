#!/bin/bash

base=`basename "$1" .mp3`

sox "$1" "$1.wav"
sndfile-waveform --no-peak -B 0xFFF8F8F8 -R 0xFF0088CC -g 1200x72 "$1.wav" "$base-on.png"
sndfile-waveform --no-peak -B 0xFFFFFFFF -R 0xFFE0E0E0 -g 1200x72 "$1.wav" "$base-off.png"

rm "$1.wav"

