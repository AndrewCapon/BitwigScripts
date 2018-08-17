var KMControlType =
{
	ctNone		: {value: 0, name: "None"},
	ctKnob 		: {value: 1, name: "Knob"},
	ctBtn 	 	: {value: 2, name: "Button"},
	ctJoy  		: {value: 3, name: "Joystick"},
	ctChannel	: {value: 4, name: "Channel"}
}

//function KMControl(type, index, value)
//{
//	this.type  = type;
//	this.index = index;
//	this.value = value;
//}

function KMControl(midiData1, midiData2)
{
	var ccIndex = midiData1 - 1;
	
	this.index 	= 0;
	this.type  	= KMControlType.ctNone;
	this.value  = midiData2;
	
	////println("CC = " + ccIndex);
	if((ccIndex >=0) && (ccIndex <=8))
	{
		// knob
		this.type = KMControlType.ctKnob;
		this.index = ccIndex;
	}
	else
	{
		if((ccIndex >=9) && (ccIndex <=17))
		{
			// button
			this.type = KMControlType.ctBtn;
			this.index = ccIndex - 9;
		}
		else
		{
			if((ccIndex >=18) && (ccIndex <=19))
			{
				// button
				this.type = KMControlType.ctJoy;
				this.index = ccIndex - 18;
			}
			else
			{
				if (ccIndex == 22)
				{
					this.type = KMControlType.ctChannel;
				}
			}
		}
	}
}
