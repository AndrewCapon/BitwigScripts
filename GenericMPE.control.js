
loadAPI(1);

host.defineController("Generic", "Generic MPE", "1.0", "18367e28-98fc-4671-8d4d-31d85b624488");
host.defineMidiPorts(1, 1);

function init()
{
   host.getMidiInPort(0).setMidiCallback(onMidi);
   noteInput = host.getMidiInPort(0).createNoteInput("", "??????");
   noteInput.setUseExpressiveMidi(true, 0, 48);

   var bendRanges = ["12", "24", "36", "48", "96"];
   bendRange = host.getPreferences().getEnumSetting("Bend Range", "MIDI", bendRanges, "24");
   bendRange.addValueObserver(function (range)
   {
      var pb = parseInt(range);
      noteInput.setUseExpressiveMidi(true, 0, pb);
   });
}

function onMidi(status, data1, data2)
{
   //printMidi(status, data1, data2);
}

function exit()
{
}
