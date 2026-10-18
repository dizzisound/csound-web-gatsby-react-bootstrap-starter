<CsoundSynthesizer>

<CsOptions>
-odac -Ma -dm0
</CsOptions>

<CsInstruments>
sr = 48000
ksmps = 32
nchnls = 2
0dbfs = 1

massign 0,0

; Two-operator FM: a sine carrier whose frequency is modulated by a sine at
; `fm_ratio` times the note's frequency. The modulation index starts at
; `fm_index` and decays to `fm_isustain` (a fraction) over `fm_idecay`
; seconds, so notes start bright and get darker, as struck sounds do.

; --- the note contract shared by every patch (see README) ---
; Each note is an instance of "fm" with a fractional number derived from its
; frequency, so a note-off can stop exactly that note (with its release).
opcode freqtrigger,0,iiii
  insno,ion,ifreq,ivel xin
  if ion == 1 then
    event "i",insno+(ifreq*0.00001),0,-1,ifreq,ivel
  else
    turnoff2 insno+(ifreq*0.00001),4,1
  endif
endop

opcode notetrigger,0,iiii
  insno,ion,ikey,ivel xin
  freqtrigger insno,ion,cpsmidinn(ikey),ivel
endop

; p4 = on/off (1/0), p5 = MIDI key, p6 = velocity (12edo)
instr trig
  notetrigger nstrnum("fm"),p4,p5,p6
  turnoff
endin

; p4 = on/off (1/0), p5 = frequency in Hz, p6 = velocity (other tunings)
instr freqtrig
  freqtrigger nstrnum("fm"),p4,p5,p6
  turnoff
endin

; Panic (all notes off): releases every "fm" voice.
instr panic
  turnoff2 nstrnum("fm"), 0, 1
  turnoff
endin

; defaults, until the page sends the widgets' values
chnset 2,"fm_ratio"
chnset 4,"fm_index"
chnset 0.8,"fm_idecay"
chnset 0.3,"fm_isustain"
chnset 0.01,"fmenv_a"
chnset 0.3,"fmenv_d"
chnset 0.6,"fmenv_s"
chnset 0.3,"fmenv_r"
chnset 0.5,"amp"

; p4 = frequency in Hz, p5 = velocity (0-127)
instr fm
  ifreq = p4
  ivel = p5/127
  kratio chnget "fm_ratio"
  kindex chnget "fm_index"
  idecay chnget "fm_idecay"
  isustain chnget "fm_isustain"
  ia chnget "fmenv_a"
  id chnget "fmenv_d"
  is chnget "fmenv_s"
  ir chnget "fmenv_r"
  kamp chnget "amp"

  ; index envelope: 1 -> isustain over idecay, then held; fades with the release
  kbright linsegr 1, max(idecay, 0.01), isustain, ir, isustain
  aenv madsr ia, id, is, ir

  kmodfreq = ifreq*kratio
  amod oscili kindex*kbright*kmodfreq, kmodfreq
  acar oscili 0.25*kamp*ivel, ifreq + amod
  aout = acar*aenv
  outs aout, aout
endin

</CsInstruments>

<CsScore>
</CsScore>
</CsoundSynthesizer>
