var KMMixerKnobMode =
{
	mmVol		  : {value: 0, name: "Volume"},
	mmPan 		: {value: 1, name: "Pan"}
}


var KMMixerBtnMode =
{
	mmArm		 		: {value: 0, name: "Record Arm"},
	mmSolo 			: {value: 1, name: "Solo"},
	mmMute 			: {value: 2, name: "Mute"},
	mmTransport : {value: 3, name: "Transport"}
	
}

function KMMixerNode(index, channel, cc)
{
	this.volume = new KMValue(index, channel, cc, 0, 0, false);
	this.pan 		= new KMValue(index, channel, cc, 0, 0, false);
	this.arm 		= new KMValue(index, channel, cc + 9, 0, 0, false);
	this.solo 	= new KMValue(index, channel, cc + 9, 0, 0, false);
	this.mute 	= new KMValue(index, channel, cc + 9, 0, 0, false);
}

function KMMixer(knobMode, btnMode, system)
{
	this.system 			= system;
	this.knobMode			= knobMode;
	this.btnMode			= btnMode;
	this.trackBank 		= system.trackBank;
	this.resetScroll 	= true;
	this.trackStart   = 1;
	this.nodes = [];
	this.nodes.length = 8;
	this.isChoosingMode = false;
	
	this.masterVolume = new KMValue(0, mixerChannel, 9, 0, false);
	
	
	// observers
	this.trackBank.addChannelScrollPositionObserver(KMMixer.prototype.displayTrackInfo, 0);
	this.system.masterTrack.getVolume().addValueObserver(127, this.getMasterVolumeObserverFunction(this.masterVolume));
	
	for(var t =0 ; t < 8; t++)
	{
		var track = this.trackBank.getTrack(t);
		track.getVolume().addValueObserver(127, this.getVolumeObserverFunction(t, this.nodes));
		track.getPan().addValueObserver(127, this.getPanObserverFunction(t, this.nodes));
		track.getMute().addValueObserver(this.getMuteObserverFunction(t, this.nodes));
		track.getSolo().addValueObserver(this.getSoloObserverFunction(t, this.nodes));
		track.getArm().addValueObserver(this.getArmObserverFunction(t, this.nodes));
		
    this.nodes[t] = new KMMixerNode(t, mixerChannel, t+1);
	}
}
 

KMMixer.prototype.getMasterVolumeObserverFunction = function(masterVolume)
{
	return function(value)
  {
    //println("Volume " + index + " changed " + value);
		masterVolume.value = value;		
  }
}

KMMixer.prototype.getVolumeObserverFunction = function(index, nodes)
{
	return function(value)
  {
    //println("Volume " + index + " changed " + value);
		nodes[index].volume.value = value;		
  }
}

KMMixer.prototype.getPanObserverFunction = function(index, nodes)
{
  return function(value)
  {
    //println("Pan " + index + " changed " + value);
		nodes[index].pan.value = value;		
  }
}

KMMixer.prototype.getMuteObserverFunction = function(index, nodes)
{
  return function(value)
  {
    //println("Mute " + index + " changed " + value);
		if (value)
			nodes[index].mute.value = 127;
		else
			nodes[index].mute.value = 0;
  }
}


KMMixer.prototype.getSoloObserverFunction = function(index, nodes)
{
  return function(value)
  {
    //println("Solo " + index + " changed " + value);
		if (value)
			nodes[index].solo.value = 127;
		else
			nodes[index].solo.value = 0;
  }
}

KMMixer.prototype.getArmObserverFunction = function(index, nodes)
{
  return function(value)
  {
    //println("Arm " + index + " changed " + value);
		if (value)
			nodes[index].arm.value = 127;
		else
			nodes[index].arm.value = 0;
  }
}

KMMixer.prototype.displayTrackInfo = function(track)
{
	host.showPopupNotification("Tracks " + (track + 1) + " - " + (track + 8));
}

KMMixer.prototype.handleModeChange = function(button)
{
	switch (button.index)
	{
		case 0:
			this.knobMode = KMMixerKnobMode.mmVol;
			host.showPopupNotification("Volume");
		break;
	
		case 1:
			this.knobMode = KMMixerKnobMode.mmPan;
			host.showPopupNotification("Pan");
		break;


		case 4:
			this.btnMode = KMMixerBtnMode.mmArm;
			host.showPopupNotification("Arm");
		break;
	
		case 5:
			this.btnMode = KMMixerBtnMode.mmSolo;
			host.showPopupNotification("Solo");
		break;

		case 6:
			this.btnMode = KMMixerBtnMode.mmMute;
			host.showPopupNotification("Mute");
		break;
	
	
		case 7:
			this.btnMode = KMMixerBtnMode.mmTransport;
			host.showPopupNotification("Transport");
		break;
	
		case 8: // Chose button mode
			//println("mode = " + this.knobMode.name);
			host.showPopupNotification("mode = " + this.knobMode.name);
			this.isChoosingMode = false;
			this.setActive(true);
			this.flush(true);
		break;
	}
	
	this.setActive(true);
}

KMMixer.prototype.handleButton = function(button)
{
	if (button.index == 8)
	{
		if (button.value == 127)
		{
			host.showPopupNotification("1-Vol, 2-Pan, 5-Arm, 6-Solo, 7-Mute, 8-Transport");
			this.isChoosingMode = true;
			this.flush();
		}
	}
	else
	{
		switch(this.btnMode)
		{
			case KMMixerBtnMode.mmArm:
				this.trackBank.getTrack(button.index).getArm().set(button.value == 127);
			break;
		
			case KMMixerBtnMode.mmMute:
				this.trackBank.getTrack(button.index).getMute().set(button.value == 127);
			break;
		
			case KMMixerBtnMode.mmSolo:
				this.trackBank.getTrack(button.index).getSolo().set(button.value == 127);
			break;
		
			case KMMixerBtnMode.mmTransport:
				system.transport.handleButton(button)
			break
		}
	}
}

KMMixer.prototype.handleControl = function(control)
{
	switch(control.type)
	{
		case KMControlType.ctKnob:
			if (control.index == 8)
			{
				this.masterVolume.updated = true;
				this.system.masterTrack.getVolume().set(control.value, 128);
			}
			else
			{
				if (this.knobMode == KMMixerKnobMode.mmVol)
				{
					this.nodes[control.index].volume.updated = true;
					this.trackBank.getTrack(control.index).getVolume().set(control.value, 128);
				}
				else
				{
					this.nodes[control.index].pan.updated = true;
					this.trackBank.getTrack(control.index).getPan().set(control.value, 128);
				}
			}
		break;
	
		case KMControlType.ctBtn:
			//println("BTN" + control.index + " - " + control.value);
			//println("bool = " + this.isChoosingMode);
			if (this.isChoosingMode)
				this.handleModeChange(control)
			else
				this.handleButton(control);
					
		break;
	
	
		case KMControlType.ctChannel:
			if (this.mode == KMMixerKnobMode.mmVol)
				host.showPopupNotification("Mixer Mode Pan");
			else
				host.showPopupNotification("Mixer Mode Volume");
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
						this.trackBank.scrollTracksUp();
						this.resetScroll = false;
					}
				}
				else
					if (control.value < (64 - deadZone))
					{
						if (this.resetScroll)
						{
							this.trackBank.scrollTracksDown();
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
				// switch to pan or vol
				if (control.value < (64 - deadZone))
				{
					if (this.resetScroll)
					{
						this.trackBank.scrollTracksPageUp();
						this.resetScroll = false;
					}
				}
				else
					if (control.value > (64 + deadZone))
					{
						if (this.resetScroll)
						{
							this.trackBank.scrollTracksPageDown();
							this.resetScroll = false;
						}
					}
					else
					{
						this.resetScroll = true;
					}
			}

		break;
		
		default:
			//println("Default");
		break;

	}	  
};


KMMixer.prototype.setActive = function(isOn)
{
	for ( var p = 0; p < 8; p++)
	{
		track = this.trackBank.getTrack(p);
		
		if (this.knobMode == KMMixerKnobMode.mmPan)
		{
			track.getVolume().setIndication(false);
			track.getPan().setIndication(isOn);
		}
		else
		{
			track.getVolume().setIndication(isOn);
			track.getPan().setIndication(false);
		}
		

	}
}

KMMixer.prototype.sendCCsForValue = function(value, force)
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

KMMixer.prototype.sendBtnMode = function (mode)
{
	//println("mode = " + mode.value)
	for(var cc = 14; cc <= 17; cc++)
	{
		if ((cc-14) == mode.value)
			sendChannelController(0, cc, 127);
		else
			sendChannelController(0, cc, 0);
	}
}

KMMixer.prototype.sendKnobMode = function (mode)
{
	//println("mode = " + mode.value)
	for(var cc = 10; cc <= 11; cc++)
	{
		if ((cc-10) == mode.value)
			sendChannelController(0, cc, 127);
		else
			sendChannelController(0, cc, 0);
	}
}


KMMixer.prototype.flush = function(force)
{
	//println("flush");
	this.sendCCsForValue(this.masterVolume, force);
	
  for(var t = 0; t < 8; t++)
  {
		// first knobs
		switch(this.knobMode)
		{
			case KMMixerKnobMode.mmPan:
				this.sendCCsForValue(this.nodes[t].pan, force);
			break;
		
			case KMMixerKnobMode.mmVol:
				this.sendCCsForValue(this.nodes[t].volume, force);
			break;
		}
			
		// then buttons
		if (this.isChoosingMode)
		{
			if (t == 0)
			{
				sendChannelController(0, 12, 0);
				sendChannelController(0, 13, 0);

				this.sendBtnMode(this.btnMode);
				this.sendKnobMode(this.knobMode);
				
				switch(this.knobMode)
				{
					case KMMixerKnobMode.mmVol:
						//println("Volume");
					break;
				
					case KMMixerKnobMode.mmPan:
						//println("Pan");
					break;
				}
				
				switch(this.btnMode)
				{
					case KMMixerBtnMode.mmArm:
						//println("Record Arm");
					break;
						
					case KMMixerBtnMode.mmMute:
						//println("Mute");
					break;
						
					case KMMixerBtnMode.mmSolo:
						//println("Solo");
					break;
						
					case KMMixerBtnMode.mmTransport:
						//println("Transport");
					break;
						
				}
			}
		}
		else
		{
			switch(this.btnMode)
			{
				case KMMixerBtnMode.mmArm:
					this.sendCCsForValue(this.nodes[t].arm, force);
				break;
				
				case KMMixerBtnMode.mmMute:
					this.sendCCsForValue(this.nodes[t].mute, force);
				break;
				
				case KMMixerBtnMode.mmSolo:
					this.sendCCsForValue(this.nodes[t].solo, force);
				break;
			
				case KMMixerBtnMode.mmTransport:
					this.system.transport.flush(force);
				break;
			
				
			}
		}
  }	
}
