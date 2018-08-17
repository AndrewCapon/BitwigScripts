
function KMSystem()
{
  this.cursorDevice   = host.createCursorDeviceSection(1);
  this.cursorTrack    = host.createCursorTrackSection(2, 0);
  this.primaryDevice  = this.cursorTrack.getPrimaryDevice();
	this.deviceBank			= this.cursorTrack.createDeviceBank(1);
	this.trackBank      = host.createTrackBankSection(8, 1, 0);
	this.masterTrack		= host.createMasterTrackSection(0);
	this.transport			= new KMTransport(host.createTransport());
}

