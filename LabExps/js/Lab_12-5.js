// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 12.5
// i.t. young
// Tuesday, 22 May 2018
// 
// ****************************************************************
// Tuesday, 22 May 2018
// Thursday, 31 May 2018
// Tuesday, 4 December 2018
//
// test signal synthesized here.
// For the sampling frequency, see: SSPconstants.js
//
// global defined here (for now)

var f0 = A3; // see SSPconstants.js
var f1 = A3flat; // see SSPconstants.js
var freqUnit = 0;

lengthMax = 2**(factor2-2); // defined in SSPmedia.js
var nn = [lengthMax] // number of complex values
var ndim = nn.length; // 1-D signal

var startIndexT = 0;
var stopIndexT = lengthMax;
var middleSampleT = lengthMax >> 1;
var newstartSample = 0;
var newstopSample = lengthMax;
var zoomLength = newstopSample - newstartSample;

var startIndexF = 0;
var stopIndexF = Math.round(2*f0*lengthMax/sampFreq);
var lengthFreq = Math.round(2*f0*lengthMax/sampFreq);
var middleSampleF = Math.round(f0*lengthMax/sampFreq);

var nLabels = 5;
var freqTicks = Array(nLabels);
var freqLabels = Array(nLabels);

var choice = 'Block'; // initial choice of window
var snrValues = [0.1, 0.3, 1, 3, 10, 30, 100, 1000];
var snrIndex = snrValues.length - 1;
var myMean = 0;
var sigma = 1/snrValues[snrIndex];

var dispMode = 'lin';

// ***************************************************************** \\

function linLog()
	{
	//  switch between "Linear" and "Logarithmic" display of vertical axis
	if (dispMode == 'lin')
		{
		layoutPSD.yaxis4.type = 'log'
		layoutPSD.yaxis4.tickmode = 'auto';
		dispMode = 'log';
		}
	else if (dispMode == 'log')
		{
		layoutPSD.yaxis4.type = 'lin'
		layoutPSD.yaxis4.tickmode = 'array';
		dispMode = 'lin';
		}
	else throw('linLog has a problem');
	displayData();
	};
	
// ***************************************************************** \\

function synthesizeData()
	{
	// go get window
	for (var i = 0; i < lengthMax; i++)  yData[i] = 0;
	for (var i = 0; i < audioData.length; i++)
		audioData[i] = sinData[i] + randomGaussian(myMean,sigma);
	
	for (var i = newstartSample; i < newstopSample; i++)
		yData[i] = dataWindow[i]*audioData[i];
	
	theName0.fS = sampFreq; // for audio reproduction
	theName0.data = audioData; // for audio reproduction
	createWavBlob(audioNum, theNames[audioNum].data);
	
	let rSpect = fft(suR(yData), nn, ndim, FORWARD); // windowed signal spectrum
	rpsd = takeAtoB(uRs(ampNormalize(abssq(rSpect))),
			0,yData.length >> 1); // global, normalized, graphics format
	};
	
// ***************************************************************** \\

function displayData()
	{
	ContTPlot.x = binning(takeAtoB(xDataCT,startIndexT,stopIndexT),altBinningFactor);
	DirtyTPlot.x = ContTPlot.x;
	ContTPlot.y = binning(takeAtoB(sinData,startIndexT,stopIndexT),altBinningFactor);
	DirtyTPlot.y = binning(takeAtoB(yData,startIndexT,stopIndexT),altBinningFactor);

	origPSDPlot.x = takeAtoB(xDataDT,startIndexF,stopIndexF);
	origPSDPlot.y = takeAtoB(origPSD,startIndexF,stopIndexF);
	psdPlot.x = origPSDPlot.x;
	psdPlot.y = takeAtoB(rpsd,startIndexF,stopIndexF);

	deltaIndex = (stopIndexF - startIndexF)/(nLabels-1);
	let a = 2*f0/((nLabels-1)*(2**freqUnit));
	let b = (f0/2)*(2 - 0.5**(freqUnit-1)); // finite geometric sum
	for (var i = 0; i < nLabels; i++)
		{
		// labels based upon f = a(freqUnit)*i + b(freqUnit)
		freqTicks[i] = Math.round(i*deltaIndex + startIndexF);
		freqLabels[i] = d0round(a*i + b);
		};
// 	freqTicks[0]++; // graphic compromise
	freqTicks[nLabels-1]--; // graphic compromise

	layoutPSD.xaxis4.tickvals = freqTicks;
	layoutPSD.xaxis4.ticktext = freqLabels;
	
	var plotSig = [ContTPlot, DirtyTPlot];
	var plotPSD = [origPSDPlot, psdPlot];
	var layoutSig = CTlayout;
	plotList[0] = [wA, plotSig, layoutSig, noMode];
	plotList[1] = [wB, plotPSD, layoutPSD, noMode];
	for (var j = 0; j < plotList.length; j++)
		{
		Plotly.react (
			plotList[j][0], // which window
			plotList[j][1], // the plot data
			plotList[j][2], // the plot layout
			plotList[j][3] // no mode
			);
		};
	};
	
// ***************************************************************** \\

function prepareLab_12_5( )
	{
	audioNum = 0;
	acquired[audioNum] = true;
	
	lengthMax = 2**(factor2-2); // defined in SSPmedia.js
	thisDuration = 1000*lengthMax/sampFreq; // defined in SSPmedia.js
	myDuration[audioNum] = thisDuration;

	// don't blink
	for (var i = 0; i < nMics; i++)
		{
		document.getElementById('animX'+i).style.animationDuration  = "0s";
		document.getElementById('animX'+i).style.animationIterationCount = "infinite";
		document.getElementById('animX'+i).style.backgroundColor = "white";
		document.getElementById('mic_'+i).style = 'filter:hue-rotate(0deg);';
		};

	freqUnit = 0;
	document.querySelector('#placeN1').value = zoomLength;
	document.querySelector('#placeN2').value = snrValues[snrIndex];
	document.querySelector('#N').value = 0;
	document.querySelector('#zt').value = 0;
	document.querySelector('#zf').value = 0;
	document.querySelector('#snr').value = 7;

	xDataDT = Array(lengthMax).fill(0);
	xDataCT = Array(lengthMax).fill(0);
	sinData = Array(lengthMax).fill(0);
	yData = Array(lengthMax).fill(0);
	dataWindow = Array(lengthMax).fill(1);
	origSpect = Array(lengthMax).fill(0);
	origPSD = Array(lengthMax).fill(0);
	audioData = Array(lengthMax).fill(0); // audio data for listening
	
	// the "real" data are synthesized just once
	for (var i = 0; i < lengthMax; i++)
		{
		xDataDT[i] = i; // discrete time index
		xDataCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		sinData[i] = Math.sin(2*Math.PI*f0*i/sampFreq) + Math.sin(2*Math.PI*f1*i/sampFreq);
		yData[i] = dataWindow[i]*sinData[i];
		};

	ContTPlot = cloneObj(CTPlot); // defined in SSPplotting.js
	CTlayout = cloneObj(layoutCT); // defined in SSPplotting.js

	psdPlot = cloneObj(SpectrumPlot); // Power spectrum graph
	layoutPSD = cloneObj(layoutSpect); // Power spectrum layout

	ContTPlot.visible = true;
	psdPlot.visible = true;
	psdPlot.marker.color = overlayStart+alphaMin+overlayFinish;
	
	graphMargins();
	CTlayout.height *= verticalScale;
	CTlayout.title = '';
	CTlayout.margin.t = margins.top;
	CTlayout.margin.b = margins.bottom;
	CTlayout.margin.l = setLeftMargin(); // orientation & platform check;
	CTlayout.margin.r = CTlayout.margin.l;

	CTlayout.annotations[0].x = 0;
	CTlayout.annotations[0].xanchor = 'left';
	CTlayout.annotations[0].y = 1.025;
	CTlayout.annotations[0].yanchor = 'bottom';
	CTlayout.annotations[0].text = 'x(t) & w(t)x(t)';

	CTlayout.annotations[1].text = 't [ms]';

	layoutPSD.title = '';
	layoutPSD.width = CTlayout.width;
	layoutPSD.height = CTlayout.height;
	layoutPSD.margin.t = CTlayout.margin.t;
	layoutPSD.margin.b = CTlayout.margin.b;
	layoutPSD.margin.l = CTlayout.margin.l;
	layoutPSD.margin.r = layoutPSD.margin.l;
	layoutPSD.xaxis4.tickmode = 'array';
	layoutPSD.yaxis4.type = 'lin';

	layoutPSD.annotations[0].x = 0;
	layoutPSD.annotations[0].xanchor = 'left';
	layoutPSD.annotations[0].y = CTlayout.annotations[0].y;
	layoutPSD.annotations[0].yanchor = CTlayout.annotations[0].yanchor;
	layoutPSD.annotations[0].text = 'Normalized S(2πf)';

	layoutPSD.annotations[1].y = CTlayout.annotations[1].y;
	layoutPSD.annotations[1].yanchor = CTlayout.annotations[1].yanchor;
	layoutPSD.annotations[1].text = 'f  [Hz]';

	origPSDPlot = cloneObj(psdPlot); // original Power spectrum graph
	origPSDPlot.marker.color = bottomCurve;
	origLayoutPSD = cloneObj(layoutPSD); // priginal Power spectrum layout
	
	origSpect = fft(suR(sinData), nn, ndim, FORWARD); // signal spectrum
	origPSD = takeAtoB(uRs(ampNormalize(abssq(origSpect))),
			0,sinData.length >> 1); // global, normalized, graphics format
			
	origPSDPlot.x = takeAtoB(xDataDT,startIndexF,stopIndexF);
	origPSDPlot.y = takeAtoB(origPSD,startIndexF,stopIndexF);

	ContTPlot.x = binning(takeAtoB(xDataCT,startIndexT,stopIndexT),altBinningFactor);
	ContTPlot.y = binning(takeAtoB(sinData,startIndexT,stopIndexT),altBinningFactor);
	DirtyTPlot = cloneObj(ContTPlot); // defined in SSPplotting.js
	DirtyTPlot.marker.color = overlayStart+alphaMin+overlayFinish;
	DirtyTPlot.x = ContTPlot.x;
	DirtyTPlot.y = binning(takeAtoB(yData,startIndexT,stopIndexT),altBinningFactor);

	chooseWindow(choice);
	synthesizeData();
	displayData();
	};

// ***************************************************************** \\

function sliderChoices(val,target)
	{
	var newSamples = lengthMax >> 2;
	var newDispSamples = lengthMax;
	var deltaN = 0; // change in number of samples (zoom)

	if (target === 'N') // Samples
		{
		newSamples = lengthMax >> val;
		document.querySelector('#placeN1').value = newSamples;
		newstartSample = middleSampleT - (newSamples >> 1);
		newstopSample = middleSampleT + (newSamples >> 1);
		chooseWindow(choice);
		synthesizeData();
		}
	else if (target === 'Zt') // Zoom (t)
		{
		newDispSamples = lengthMax >> val;
		if (oddQ(newSamples)) newSamples--; // make it even
		deltaN = newDispSamples >> 1;
	
		startIndexT = middleSampleT - deltaN;
		if (startIndexT < 0)
			{
			startIndexT = 0;
			stopIndexT = startIndexT + deltaN;
			};
		stopIndexT = middleSampleT + deltaN;
		if (stopIndexT > lengthMax)
			{
			stopIndexT = lengthMax;
			startIndexT = lengthMax - deltaN;
			};
		}
	else if (target === 'Zf') // Zoom (f)
		{
		freqUnit = val;
		newDispSamples = lengthFreq >> freqUnit;
		if (oddQ(newDispSamples)) newDispSamples--; // make it even
		deltaN = newDispSamples >> 1;
	
		startIndexF = middleSampleF - deltaN;
		if (startIndexF < 0)
			{
			startIndexF = 0;
			stopIndexF = startIndexF + newDispSamples;
			};
		stopIndexF = middleSampleF + deltaN;
		if (stopIndexF > lengthMax)
			{
			stopIndexF = lengthMax;
			startIndexF = lengthMax - newDispSamples;
			};
		}
	else 
		throw("Sliders");
	displayData();
	};

// ***************************************************************** \\

function moveSlider(val)
	{
	let thisSNR = snrValues[val];
	document.querySelector('#placeN2').value = thisSNR;
	};

// ***************************************************************** \\
// Choose SNR factor with slider

function getSNR(val)
	{
	thisSNR = snrValues[val];
	document.querySelector('#placeN2').value = thisSNR;
	sigma = 1/thisSNR;
	synthesizeData();
	displayData();
	};

// ***************************************************************** \\

function chooseWindow(target)
	{
	choice = target;
	let slope = 2/(newstopSample - newstartSample);
	let offset = -(newstopSample + newstartSample)/(newstopSample - newstartSample);
	let windowSigma = 1/4;
	for (var i = 0; i < lengthMax; i++)  dataWindow[i] = 0;

	if (choice === 'Block') // Block (rectangular) window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = block(slope*i + offset,windowSigma);
		}
	else if (choice === 'Bartlett') // Bartlett window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = bartlett(slope*i + offset,windowSigma);
		}
	else if (choice === 'Parzen') // Parzen window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = parzen(slope*i + offset,windowSigma);
		}
	else if (choice === 'Gauss') // Gauss window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = truncGauss(slope*i + offset,windowSigma);
		}
	else if (choice === 'Verbeek') // Verbeek window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = truncVerbeek(slope*i + offset,windowSigma);
		}
	else if (choice === 'Tukey') // Tukey window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = tukey(slope*i + offset,windowSigma);
		}
	else if (choice === 'Hamming') // Hamming window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = hamming(slope*i + offset,windowSigma);
		}
	else if (choice === 'Hann') // Hann window
		{
		for (var i = newstartSample; i < newstopSample; i++)
			dataWindow[i] = hann(slope*i + offset,windowSigma);
		}
	else throw('Houston, we have a problem in chooseWindow.');
	
	document.querySelector('#placeW').value = choice;
	synthesizeData();
	displayData();
	};

