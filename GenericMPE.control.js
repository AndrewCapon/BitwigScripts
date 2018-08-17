
loadAPI(1);

host.defineController("Generic", "Generic MPE", "1.0", "54292f1f-4f26-4c6d-aa07-d7763e65d8a6");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Seaboard Block"], ["Seaboard Block"]);

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
