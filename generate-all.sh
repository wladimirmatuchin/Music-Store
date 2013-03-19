#!/bin/bash

IFS=`echo -ne "\n\b"`
for fn in `ls *.mp3`; do
	base=`basename $fn .mp3`
	sox "$fn" "$base.wav"

	sndfile-waveform --no-peak -B 0xFFF8F8F8 -R 0xFF0088CC -g 1200x72 "$base.wav" "$base-on.png"
	sndfile-waveform --no-peak -B 0xFFFFFFFF -R 0xFFE0E0E0 -g 1200x72 "$base.wav" "$base-off.png"
	
	rm "$base.wav"
done


