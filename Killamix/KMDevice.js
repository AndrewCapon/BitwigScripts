var KMDeviceKnobMode =
{
	kmMacro		 		: {value: 0, name: "Macro"},
	kmCommon 			: {value: 1, name: "Common"},
	kmEnv					: {value: 2, name: "Env"},
	kmParams 			: {value: 3, name: "Params"},
	kmSends 			: {value: 4, name: "Sends"},
}

function KMDevice(system)
{
	this.system = system;
	this.primaryDevice 	= system.primaryDevice;
	//this.trackBank 			= host.createMainTrackBankSection(8, 8, 0);
	this.cursorTrack 		= host.createCursorTrackSection(8, 64);
	this.knobMode				= KMDeviceKnobMode.kmMacro;
	
	//this.primaryDevice.addHasSelectedDeviceObserver
	
	// create macros array
	this.macros = [];
	this.macros.length = 8;
	
	this.commons = [];
	this.commons.length = 8;
	
	this.envs = [];
	this.envs.length = 8;

	this.params = [];
	this.params.length = 8;

	this.sends = [];
	this.sends.lemgth = 8;
	
	this.masterVolume = new KMValue(0, deviceChannel, 9, 0, false);
	
	
	// observers
	this.system.masterTrack.getVolume().addValueObserver(127, this.getMasterVolumeObserverFunction(this.masterVolume));

  for ( var i = 0; i < 8; i++)
  {
    this.primaryDevice.getMacro(i).getAmount().addValueObserver(127, this.getMacroObserverFunction(i, this.macros));
		this.primaryDevice.getCommonParameter(i).addValueObserver(127, this.getCommonObserverFunction(i, this.commons));
		this.primaryDevice.getEnvelopeParameter(i).addValueObserver(127, this.getEnvObserverFunction(i, this.envs));
		this.primaryDevice.getParameter(i).addValueObserver(127, this.getParamObserverFunction(i, this.params));
		//this.trackBank.getTrack(0).getSend(i).addValueObserver(127, this.getParamObserverFunction(i, this.sends));
		//this.trackBank.getTrack(i).addIsSelectedObserver(this.getTrackSelectObserverFunction(i));

		this.cursorTrack.getSend(i).addValueObserver(127, this.getParamObserverFunction(i, this.sends));
		//this.cursorTrack.addIsSelectedObserver(this.getTrackSelectObserverFunction(i));
    
    this.macros[i] 		= new KMValue(i, deviceChannel, i+1, 0, 0, false);
    this.commons[i] 	= new KMValue(i, deviceChannel, i+1, 0, 0, false);
    this.envs[i] 			= new KMValue(i, deviceChannel, i+1, 0, 0, false);
    this.params[i] 		= new KMValue(i, deviceChannel, i+1, 0, 0, false);
    this.sends[i] 		= new KMValue(i, deviceChannel, i+1, 0, 0, false);
		
  }
	
	//for(var p=0; p < 8; p++)
	//{
	//	println(p);
	//	this.primaryDevice.getParameter(p).setIndication(true);
	//}
	
	
	// set indicators
	this.setIndicators();
}

KMDevice.prototype.setIndicators = function()
{
	for(var i=0; i < 8; i++)
	{
		this.primaryDevice.getMacro(i).getAmount().setIndication(this.knobMode == KMDeviceKnobMode.kmMacro);
		this.primaryDevice.getCommonParameter(i).setIndication(this.knobMode == KMDeviceKnobMode.kmCommon);
		this.primaryDevice.getEnvelopeParameter(i).setIndication(this.knobMode == KMDeviceKnobMode.kmEnv);
		this.primaryDevice.getParameter(i).setIndication(this.knobMode == KMDeviceKnobMode.kmParams);
		//this.trackBank.getTrack(0).getSend(i).setIndication(this.knobMode == KMDeviceKnobMode.kmSends);
		this.cursorTrack.getSend(i).setIndication(this.knobMode == KMDeviceKnobMode.kmSends);

	}
	
	//flush(true);
}

KMDevice.prototype.handleButton = function(button)
{
	switch (button.index)
	{
		case 0:
			if (button.value == 127)
			{
				this.knobMode = KMDeviceKnobMode.kmMacro;
				host.showPopupNotification(this.knobMode.name);
				this.setIndicators();
				this.flush(true);

			}
		break;
	
		case 1:
			if (button.value == 127)
			{
				this.knobMode = KMDeviceKnobMode.kmCommon;
				host.showPopupNotification(this.knobMode.name);
				this.setIndicators();
				this.flush(true);
			}
		break;


		case 2:
			if (button.value == 127)
			{
				this.knobMode = KMDeviceKnobMode.kmEnv;
				host.showPopupNotification(this.knobMode.name);
				this.setIndicators();
				this.flush(true);
			}
		break;
	
		case 3:
			if (button.value == 127)
			{
				this.knobMode = KMDeviceKnobMode.kmParams;
				host.showPopupNotification(this.knobMode.name);
				this.setIndicators();
				this.flush(true);
			}
		break;
	
		case 4:
			if (button.value == 127)
			{
				this.knobMode = KMDeviceKnobMode.kmSends;
				host.showPopupNotification(this.knobMode.name);
				this.setIndicators();
				this.flush(true);
			}
		break;
	
		case 5:
			if (button.value == 127)
			{
				host.showPopupNotification("Previous param page");
				this.primaryDevice.previousParameterPage();
			}
		break;

		case 6:
			if (button.value == 127)
			{
				host.showPopupNotification("Next param page");
				this.primaryDevice.nextParameterPage();
			}
		break;
	
		case 7:
			if (button.value == 127)
			{
				host.showPopupNotification("prev device");
				this.primaryDevice.switchToDevice(DeviceType.ANY,ChainLocation.PREVIOUS);
				//this.system.cursorDevice.selectPrevious();
			}
		break;
	
		case 8:
			if (button.value == 127)
			{
				host.showPopupNotification("next device");
				this.primaryDevice.switchToDevice(DeviceType.ANY,ChainLocation.NEXT);
				//this.system.cursorDevice.selectNext();
			}
		break;
	

	}
	
	this.setActive(true);
}	

KMDevice.prototype.handleKnob = function(knob)
{
	if (knob.index == 8)
	{
		this.masterVolume.updated = true;
		this.system.masterTrack.getVolume().set(knob.value, 128);
	}
	else
	{
		switch(this.knobMode)
		{
			case KMDeviceKnobMode.kmMacro:
				this.macros[knob.index].updated = true;
				this.primaryDevice.getMacro(knob.index).getAmount().set(knob.value, 128);
			break;
			
			case KMDeviceKnobMode.kmCommon:
				this.commons[knob.index].updated = true;
				this.primaryDevice.getCommonParameter(knob.index).set(knob.value, 128);
			break;
		
			case KMDeviceKnobMode.kmEnv:
				this.envs[knob.index].updated = true;
				this.primaryDevice.getEnvelopeParameter(knob.index).set(knob.value, 128);
			break;
		
			case KMDeviceKnobMode.kmParams:
				this.params[knob.index].updated = true;
				this.primaryDevice.getParameter(knob.index).set(knob.value, 128);
			break;
		
			case KMDeviceKnobMode.kmSends:
				this.sends[knob.index].updated = true;
				//this.trackBank.getTrack(0).getSend(knob.index).set(knob.value,128);
				this.cursorTrack.getSend(knob.index).set(knob.value,128);
				
			break;
		}
	}
}

KMDevice.prototype.handleControl = function(control)
{
  switch(control.type)
	{
		case KMControlType.ctChannel:
			//println("device Mode");
			host.showPopupNotification("Device Mode");
			this.setActive(true);
		break;

		case KMControlType.ctKnob:
			this.handleKnob(control);
//			this.macros[control.index].updated = true;
//			this.primaryDevice.getMacro(control.index).getAmount().set(control.value, 128);
		break;
	
		case KMControlType.ctBtn:
			this.handleButton(control);
			
			//if ((control.index >= 0 ) && (control.index <=3))
			//{
			//	this.btnMode.value = control.index;
			//	host.showPopupNotification(this.btnMode.name);
			//	this.setActive(true);
			//}
			//else
			//{
			//	switch (control.index)
			//	{
			//		
			//	}
			//}
//			if (control.index == 0)
//			{
//				if (control.value == 127)
//				{
//					println("prev")
//					this.primaryDevice.previousParameterPage();
//				}
//    	}
//			else
//			{
//				if (control.value == 127)
//				{
//					println("next")
//					this.primaryDevice.nextParameterPage();
//				}
//			}
		break;
	
		case KMControlType.ctJoy:
			////println("JOY " + control.index);
			var deadZone = 5;
			if (control.index == 1)
			{
				if (control.value > (64 + deadZone))
				{
					if (this.resetScroll)
					{
						//this.trackBank.scrollTracksUp();
						this.cursorTrack.selectPrevious();
						this.resetScroll = false;
					}
				}
				else
					if (control.value < (64 - deadZone))
					{
						if (this.resetScroll)
						{
							//this.trackBank.scrollTracksDown();
							this.cursorTrack.selectNext();
							this.resetScroll = false;
						}
					}
					else
					{
						this.resetScroll = true;
					}
			}
			else
			{
				//// switch to pan or vol
				//if (control.value < (64 - deadZone))
				//{
				//	if (this.resetScroll)
				//	{
				//		this.trackBank.scrollTracksPageUp();
				//		this.resetScroll = false;
				//	}
				//}
				//else
				//	if (control.value > (64 + deadZone))
				//	{
				//		if (this.resetScroll)
				//		{
				//			this.trackBank.scrollTracksPageDown();
				//			this.resetScroll = false;
				//		}
				//	}
				//	else
				//	{
				//		this.resetScroll = true;
				//	}
			}
	}
}; 


KMDevice.prototype.setActive = function(isOn)
{
	this.setIndicators();
	this.sendKnobMode(this.knobMode);
	
}

KMDevice.prototype.getMasterVolumeObserverFunction = function(masterVolume)
{
	return function(value)
  {
    //println("Volume " + index + " changed " + value);
		masterVolume.value = value;		
  }
}

KMDevice.prototype.getTrackSelectObserverFunction = function(index)
{
  return function(value)
  {
		println("selected [" + index + "] = " + value);
  }
}

KMDevice.prototype.getMacroObserverFunction = function(index, macroArray)
{
  return function(value)
  {
    macroArray[index].value = value;
  }
}

KMDevice.prototype.getCommonObserverFunction = function(index, commonArray)
{
  return function(value)
  {
    commonArray[index].value = value;
  }
}


KMDevice.prototype.getEnvObserverFunction = function(index, envArray)
{
  return function(value)
  {
    envArray[index].value = value;
  }
}

KMDevice.prototype.getParamObserverFunction = function(index, paramArray)
{
  return function(value)
  {
		//println("Param[" + index + "] = " + value);
    paramArray[index].value = value;
  }
}


KMDevice.prototype.getSendObserverFunction = function(index, sendArray)
{
  return function(value)
  {
		//println("Param[" + index + "] = " + value);
    sendArray[index].value = value;
  }
}

KMDevice.prototype.sendKnobMode = function (mode)
{
	//println(mode);
	//println(this.btnMode);
	//var output = '';
	//for (var property in mode)
	//{
	//	output += property + ': ' + mode[property]+'; ';
	//}
	//println(output);

	//println("mode = " + this.knobMode.value)
	for(var cc = 10; cc <= 14; cc++)
	{
		if ((cc-10) == mode.value)
			sendChannelController(1, cc, 127);
		else
			sendChannelController(1, cc, 0);
	}
}

KMDevice.prototype.sendCCsForValue = function(value, force)
{
	////println(value.value + " - " + value.oldValue);
	if((value.value != value.oldValue) || force)
	{
		if((value.updated == false) || force)
		{
			//println("different " + value.oldValue + ", " + value.value);
			sendChannelController(value.channel-1, value.cc, value.value);
			value.oldValue = value.value;
		}
		else
		{
			value.updated = false;
			value.oldValue = value.value;
		}
	}
}

KMDevice.prototype.flush = function(force)
{
	//println("flush");
	this.sendCCsForValue(this.masterVolume, force);

  for(var i = 0; i < 8; i++)
  {
		var value;
		switch(this.knobMode)
		{
			case KMDeviceKnobMode.kmMacro:
				value = this.macros[i];
			break;
			
			case KMDeviceKnobMode.kmCommon:
				value = this.commons[i];
			break;
		
			case KMDeviceKnobMode.kmEnv:
				value = this.envs[i];
			break;
		
			case KMDeviceKnobMode.kmParams:
				value = this.params[i];
			break;
		
			case KMDeviceKnobMode.kmSends:
				value = this.sends[i];
			break;
		}
		this.sendCCsForValue(value);
//		//println(i + " = " + value.value + " - " + value.oldValue + " - " + value.updated);
//    if((value.value != value.oldValue) || force)
//    {
//      if((value.updated == false) || force)
//      {
//				//println("different");
//        sendChannelController(value.channel-1, value.cc, value.value);
//        value.oldValue = value.value;
//      }
//      else
//      {
//        value.updated = false;
//        value.oldValue = value.value;
//      }
//    }
  }
	
	this.sendKnobMode(this.knobMode);
}
