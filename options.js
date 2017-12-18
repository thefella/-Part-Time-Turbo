document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);


//! i18n Translation
var elements = document.querySelectorAll('[data-translate]');
[].forEach.call(elements, function(element) {
	element.textContent = chrome.i18n.getMessage(element.dataset.translate);
});



//! Save the options page
function save_options() 
{
	//! Get the URLs from the textarea
	var textareaUrls = document.getElementById('urls').value.split('\n');
	var statusMessage = document.getElementById('status');
	var errorMessage = document.getElementById('errors');
	var valid;
	var errors = [];
	
	//! Check URLs for right pattern
	for (let item of textareaUrls) {
		if (checkUrl(item)) {
			valid = true;
		}
		else {
			errors.push(item);
			valid = false;
		}
	}
	
	//! If URLs have a bad pattern
	if (valid == false) 
	{
		if (errors.length == 1) {
			errorMessage.innerHTML = 'Please double-check this URL: <br><br>';
		}
		else {
			errorMessage.innerHTML = 'Please double-check these URLs: <br><br>';
		}
		errorMessage.innerHTML += '<em>' + errors.toString().replace(",", "<br>") + '</em>';
		errorMessage.style.display = "block";
	}
	
	//! If everything is okay
	if (valid == true) 
	{
		//! Save to storage
		chrome.storage.local.set(
		{
			exclusionUrls: textareaUrls
		}, 
		function(data) 
		{
			// Update status to let user know options were saved.
			statusMessage.textContent = 'Your settings have been successfully saved!';
			errorMessage.innerHTML = '';
			errorMessage.style.display = "none";
			statusMessage.style.display = "block";
			setTimeout(function() 
			{
				statusMessage.style.display = "none";
				statusMessage.textContent = '';
				
			}, 3000);
		});
	}
}



//! Populate page with existing options
function restore_options() 
{	
	chrome.storage.local.get("exclusionUrls", function(items) 
	{
		urlList = ""+items.exclusionUrls;
		document.getElementById('urls').value = urlList.split(',').join('\n');
	});
}



//! Check formation of URLs with regex
function checkUrl(url) {

	const schemeSegment = '(\\*|http|https|file|ftp)';
    const hostSegment = '(\\*|(?:\\*\\.)?(?:[^/*]+))?';
    const pathSegment = '(.*)';
	var r = new RegExp(`^${schemeSegment}://${hostSegment}/${pathSegment}$`);
	var message = "";
	
	if (r.test(url)) {
		return true;
	}
	else 
	{
		return false;
	}
}