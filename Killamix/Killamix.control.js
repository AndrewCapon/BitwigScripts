load("KMTransport.js");
load("KMSystem.js");
load("KMMixer.js");
load("KMDevice.js");
load("KMValue.js");
load("KMControl.js");


loadAPI(1);

host.defineController("Kenton Killamix", "Killamix Macro and 152 controls", "1.0", "320e850f-cd45-41f9-98d9-0e3b0e3ab39d");


host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Kenton Killamix Mini"], ["Kenton Killamix Mini"]);


var knobCount     = 9;
var btnCount      = 9;
var joyCount      = 2;

var mixerChannel	= 1;
var deviceChannel = 2;

var userStartChannel	= 3;
var userEndChannel		= 9;
var userChannelCount  = 1 + userEndChannel - userStartChannel;

var controlBankSize = knobCount + btnCount + joyCount;
var userControlCount = userChannelCount * controlBankSize;


var LOWEST_CC = 2;
var HIGHEST_CC = 119;

var DEVICE_START_CC = 2;
var DEVICE_END_CC = 10;


var values = [];
values.length = userControlCount;

 



var mixer;
var device;
var system;


 
function getIndex(channel, cc)
{
  var index = ((channel-userStartChannel) * controlBankSize) + (cc -1);
  
//  //println("INDEX: " + index + " Channel: " + channel);
  
  return index;
}




function init()
{
  //println("Killamix start init");
	system = new KMSystem();
	println(system.masterTrack);
	device = new KMDevice(system);
	mixer  = new KMMixer(KMMixerKnobMode.mmVol, KMMixerBtnMode.mmArm, system);
	

  host.getMidiInPort(0).setMidiCallback(onMidi);



  

  var valueArray = initArray(0, userControlCount);
  
 
  

  // Make the rest freely mappable
  userControls = host.createUserControlsSection(userControlCount);

  var controlIndex = 0;

  for( var c = userStartChannel; c <= userEndChannel; c++)
  {
    //println("");
    for( var k = 1; k <= knobCount; k++)
    {
      values[controlIndex] = new KMValue(controlIndex, c, k, 0, 0, false);
      
      var control = userControls.getControl(controlIndex);
      control.setLabel("Knob " + c + "/" +k);
      control.addValueObserver(127, getValueObserverFunction(controlIndex++, values));
    }

    for( var b = 1; b <= btnCount; b++)
    {
      values[controlIndex] = new KMValue(controlIndex, c, b + 9, 0, 0, false);
      
      var control = userControls.getControl(controlIndex);
      control.setLabel("Button " + c + "/" +b);
      control.addValueObserver(127, getValueObserverFunction(controlIndex++, values));
    }

    values[controlIndex] = new KMValue(controlIndex, c, 19, 0, 0, false);
    var control = userControls.getControl(controlIndex);
    control.setLabel("Joystick " + c + "/X");
    control.addValueObserver(127, getValueObserverFunction(controlIndex++, values));

    values[controlIndex] = new KMValue(controlIndex, c, 20, 0, 0, false);
    var control = userControls.getControl(controlIndex);
    control.setLabel("Joystick " + c + "/Y");
    control.addValueObserver(127, getValueObserverFunction(controlIndex++, values));
  }
  
  
  //println("Killamix end init");
}

function exit()
{
}

function flush()
{
	mixer.flush(false);
	device.flush(false);
	
  
  for(var v = 0; v < userControlCount; v++)
  {
    if(values[v].value != values[v].oldValue)
    {
      if(values[v].updated == false)
      {
        //println("send CC " + values[v].channel + ", " + values[v].cc + ", " + values[v].value);
        sendChannelController(values[v].channel-1, values[v].cc, values[v].value);
        values[v].oldValue = values[v].value;
      }
      else
      {
        values[v].updated = false;
        values[v].oldValue = values[v].value;
      }
    }
  }
}

function midiChannelFromStatus(status)
{
  return ((status & 0x0f) +1);
}

  

function getValueObserverFunction(index, valueArray)
{
  return function(value)
  {
    ////println("Value " + index + " changed " + value);
    valueArray[index].value = value;
  }
}





function onMidi(status, data1, data2)
{
	if (isChannelController(status))
	{
    var midiChannel = midiChannelFromStatus(status);
		var control			= new KMControl(data1, data2);

		system.transport.setChannel(midiChannel);
		
		switch(midiChannel)
		{
			case mixerChannel:
				if (control.type == KMControlType.ctChannel)
				{
					device.setActive(false);
					mixer.setActive(true);
				}
				mixer.handleControl(control);
			break;
		
			case deviceChannel:
				if (control.type == KMControlType.ctChannel)
				{
					device.setActive(true);
					mixer.setActive(false);
				}
				device.handleControl(control);
			break;
		
		
			default:
        var index = getIndex(midiChannel, data1);
        ////println("calling getControl " + index + " " + userControls);
        values[index].updated = true;
        userControls.getControl(index).set(data2, 128);
			break;
    }
	}
}
