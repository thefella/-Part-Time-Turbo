"use strict";


//! Excluded URLs array
var excludedUrls = [];
updateExcludedUrls();


//! On change of tab
chrome.tabs.onActivated.addListener(function() {
	checkTab();
});


//! On update of tab
chrome.tabs.onUpdated.addListener(function() {
	checkTab();
});



//! On install
chrome.runtime.onInstalled.addListener(function(details) {
	
	//! First install
	if (details.reason == "install")
	{
        console.log("This is a first install!");
		chrome.runtime.openOptionsPage(); 
    } 
    else if(details.reason == "update") 
    {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
    
	checkStatus();
});



//! Get URLs to exclude from options / storage
function updateExcludedUrls() {
	chrome.storage.local.get("exclusionUrls", function(data) 
	{
		excludedUrls = "" + data.exclusionUrls;
		excludedUrls = excludedUrls.split(',');
	});
}



//! Check for excluded URL changes and update
chrome.storage.onChanged.addListener(function(changes, area) 
{
    if (area == "local" && "exclusionUrls" in changes) {
        updateExcludedUrls();
    }	
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
	//! Check storage to see if Turbo was ON or OFF
	chrome.storage.local.get("turboStatus", function(data) 
	{	
		//! If Turbo was ON, turn it OFF for excluded URLs, then turn it back ON afterwards
		if (data.turboStatus == "on" && excludedUrls.toString() !== 'undefined') 
		{	
			chrome.tabs.query({ active: true, currentWindow: true, url:excludedUrls }, function(tabsArray) 
			{
			    //if (tabsArray[0]) 
			    if (typeof tabsArray !== 'undefined' && tabsArray.length > 0)
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