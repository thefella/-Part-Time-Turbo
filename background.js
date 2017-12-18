"use strict";

//! Array of URLs to exclude
/*
	var excludedUrls = [
	'*://*.netflix.com/watch/*', 
	'*://*.amazon.co.uk/gp/product/*'
	];
*/
var excludedUrls;

//! Get URLs to exclude from options / storage
chrome.storage.local.get("exclusionUrls", function(data) 
{
	excludedUrls = "" + data.exclusionUrls;
	excludedUrls = excludedUrls.split(',');
});


//chrome.storage.onChanged.addListener(callback)
chrome.storage.onChanged.addListener(async function(changes, areaName) {
	//alert('storage changed');
});


//! On install
chrome.runtime.onInstalled.addListener(function(details) {
	checkStatus();
});

//! On change of tab
chrome.tabs.onActivated.addListener(function() {
	checkTab();
});

//! On update of tab
chrome.tabs.onUpdated.addListener(function() {
	checkTab();
});



//! Check initial status and set appropriate icon and setting
function checkStatus() 
{
	opr.offroad.enabled.get({}, function(details) 
	{
		if (details.levelOfControl === 'controllable_by_this_extension' || details.levelOfControl === 'controlled_by_this_extension') 
		{
			 if (details.value == true) 
			 {
			 	// Status: ON
			 	setIcon("on");
			 	setPersistence("on");
			 } 
			 else 
			 {
			 	// Status: OFF
			 	setIcon("off");
			 	setPersistence("off");
			 }
		}
	});
}



//! Change icon to show if ON or OFF
function setIcon(status) 
{
	if (status == "on") 
	{
		chrome.browserAction.setIcon({ path: {48: 'icons/icon_48.png'} });		
	}
	else if (status == "off") 
	{
		chrome.browserAction.setIcon({ path: {48: 'icons/icon_48_inactive.png'} });
	}
}



//! Change storage value to ON or OFF
function setPersistence(status) 
{
	if (status == "on") 
	{
		chrome.storage.local.set({'turboStatus': "on"}, function() { /*console.log('Storage updated to ON');*/ });
	}
	else if (status == "off") 
	{
		chrome.storage.local.set({'turboStatus': "off"}, function() { /*console.log('Storage updated to OFF');*/ });
	}
	
	//! Check storage and log it
	/*chrome.storage.local.get("turboStatus", function(data) 
	{
		console.log("Storage result: " + data.turboStatus);
	});*/
}



//! Click browser button to turn turbo ON or OFF
chrome.browserAction.onClicked.addListener(function() 
{
	//! Check Turbo status
	opr.offroad.enabled.get({}, function(details) 
	{
		if (details.levelOfControl === 'controllable_by_this_extension' || details.levelOfControl === 'controlled_by_this_extension') 
		{
		 	//! If ON, turn OFF
			if (details.value == true) 
			{
				opr.offroad.enabled.set({'value': false}, function(){
			 		setIcon("off");
			 		setPersistence("off");
				});
			} 
			//! If OFF, turn ON
			else 
			{
				opr.offroad.enabled.set({'value': true}, function(){
			 		setIcon("on");
			 		setPersistence("on");
				});
			}
		}
	});
});



//! Turn OFF for excluded URLs (if already ON)
function checkTab() 
{
	//var turboStatus;
	
	//! Check storage to see if Turbo was ON or OFF
	chrome.storage.local.get("turboStatus", function(data) 
	{
		//console.log("checkTab: " + data.turboStatus);
		//turboStatus = data.turboStatus;
		
		//! If Turbo was ON, turn it OFF for excluded URLs, then turn it back ON afterwards
		if (data.turboStatus == "on") 
		{
			chrome.tabs.query({ active: true, currentWindow: true, url:excludedUrls }, function(tabsArray) 
			{
			    if (tabsArray[0]) 
			    {
				    opr.offroad.enabled.set({'value': false}, function(){});
				    setIcon("off");
			    } 
			    else 
			    {
				    opr.offroad.enabled.set({'value': true}, function(){});
					setIcon("on");
			    }
			});
		}

	});
}