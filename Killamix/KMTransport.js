var KMTransportBtns =
{
	tbTogglePlay	: {value: 0, name: "Toggle Play"},
	tbRestart	 		: {value: 1, name: "Restart"},
	tbRecord	 		: {value: 2, name: "Record"},
	tbArrangerAuto: {value: 3, name: "Arranger Automation"},
	tbClipAuto		: {value: 4, name: "Clip Automation"},
	tbRewind  		: {value: 5, name: "Rewind"},
	tbForward	 		: {value: 6, name: "Forward"},
	tbLoop		 		: {value: 7, name: "Loop"}
}

function btnValue(value)
{
	this.value = value;
	this.oldValue = false;
}

function KMTransport(transport)
{
  this.transport = transport;
	this.channel = 0;
	
	this.btnFlags = [];
	this.btnFlags.length = 8;
	
	for(var b= 0; b< 8; b++)
		this.btnFlags[b] = new btnValue(false);

	this.transport.addIsPlayingObserver(this.getBtnObvserver(KMTransportBtns.tbTogglePlay.value, this.btnFlags));
	this.transport.addIsRecordingObserver(this.getBtnObvserver(KMTransportBtns.tbRecord.value, this.btnFlags));
	this.transport.addIsWritingArrangerAutomationObserver(this.getBtnObvserver(KMTransportBtns.tbArrangerAuto.value, this.btnFlags));
	this.transport.addIsWritingClipLauncherAutomationObserver(this.getBtnObvserver(KMTransportBtns.tbClipAuto.value, this.btnFlags));
	this.transport.addIsLoopActiveObserver(this.getBtnObvserver(KMTransportBtns.tbLoop.value, this.btnFlags));
	
}

KMTransport.prototype.setChannel = function(channel)
{
	this.channel = channel;
}

KMTransport.prototype.getBtnObvserver = function(index, btnArray)
{
  return function(value)
  {
    btnArray[index].value = value;
  }
}


KMTransport.prototype.handleButton = function(button)
{
	switch (button.index)
	{
		case KMTransportBtns.tbTogglePlay.value:
			println("play");
			this.transport.play();
		break;
	
		case KMTransportBtns.tbRestart.value:
			if (button.value == 127)
			{
				println("restart");
				this.transport.restart();
				this.flush(true);
			}
		break;

		case KMTransportBtns.tbRecord.value:
			println("Record");
			this.transport.record();
		break;
	
		case KMTransportBtns.tbArrangerAuto.value:
			println("Arranger Auto");
			this.transport.toggleWriteArrangerAutomation();
		break;

		case KMTransportBtns.tbClipAuto.value:
			println("Clip Auto");
			this.transport.toggleWriteClipLauncherAutomation();
		break;
	
		case KMTransportBtns.tbRewind.value:
			if (button.value == 127)
			{
				println("rewind");
				this.transport.rewind();
				this.flush(true);
			}
		break;
	
		case KMTransportBtns.tbForward.value:
			if (button.value == 127)
			{
				println("forward");
				this.transport.fastForward();
				this.flush(true);
			}
		break;
		
		case KMTransportBtns.tbLoop.value:
			println("loop");
			this.transport.toggleLoop();
		break;

	}
}

KMTransport.prototype.flush = function(force)
{
	for(var b=0; b < 8; b++)
	{
		//println(b + " : " + this.btnFlags[b].value + ", " + this.btnFlags[b].oldValue);
		if ((this.btnFlags[b].value != this.btnFlags[b].oldValue) || force)
		{
			//println("sending");
			sendChannelController(this.channel-1, b+10, this.btnFlags[b].value ? 127 : 0);
			this.btnFlags[b].oldValue = this.btnFlags[b].value;
		}
	}
}