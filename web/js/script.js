let openSidebar = true;
let currentChatHistroyId = generateChatHistoryId();
let newChat = false;

document.addEventListener('DOMContentLoaded', function () {
	field = document.getElementById('chatInput');
	autoExpand(field);
	asyncInit();
});

async function asyncInit() {
	try {
		loadChathistoryfromIndexedDb(currentChatHistroyId);
	} catch (error) {}
	await new Promise((r) => setTimeout(r, 500));
	addSettingsEventListener();
	loadChathistorysList();
}

function generateChatHistoryId() {
	if (localStorage.getItem('sessionID') != null) {
		return localStorage.getItem('sessionID');
	}
	let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return id;
}

function generateNewChatHistoryId() {
	let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return id;
}

function sendMessage() {
	let sendMessageContainer = document.getElementById('chatInput');
	message = sendMessageContainer.value;
	if (message.endsWith('\n')) {
		message = message.slice(0, -1);
	}

	// regex to check if message is only new lines
	let regex = /^\s*$/;

	if (message == '' || message == null || message == undefined || message == ' ' || regex.test(message)) {
		return;
	}

	let systemPrompt = document.getElementById('systemPrompt').value;

	let messages = [{ role: 'system', content: systemPrompt }];

	let model = document.getElementById('modelSelect').value;
	let maxTokens = document.getElementById('maxTokensInput').value;
	let temperature = document.getElementById('tempSlider').value;

	let seed = document.getElementById('seedInput')?.value;

	let messagesContainer = document.getElementsByClassName('message');

	let sprache = document.getElementById('sprache').value;
	// Add the Previous Messages to the messages

	let spracheAbkürtungFullDict = {
		de: 'deutsch',
		en: 'englisch',
		es: 'spanisch',
		fr: 'französisch',
		it: 'italienisch',
		pt: 'portugiesisch',
		ru: 'russisch',
		zh: 'chinesisch',
	};

	let spracheAbkürzung = spracheAbkürtungFullDict[sprache];

	let languageTempSentence = '\nAntworte mir bitte auf ' + spracheAbkürzung + '.\n\n';

	try {
		for (let i = 0; i < messagesContainer.length; i++) {
			if (messagesContainer[i].classList.contains('user-message')) {
				messages.push({ role: 'user', content: messagesContainer[i].innerText });
			} else if (messagesContainer[i].classList.contains('ai-message')) {
				messages.push({ role: 'assistant', content: messagesContainer[i].innerText });
			}
		}
	} catch (error) {}

	messages.push({ role: 'user', content: message + languageTempSentence });

	let data = {
		messages: messages,
		model: model,
		maxTokens: maxTokens,
		temperature: temperature,
		seed: seed,
		stop: null,
		top_p: null,
		frequency_penalty: null,
	};

	document.getElementById('chatInput').value = '';

	let messageContainer = document.createElement('span');

	messageContainer.classList.add('message');
	messageContainer.classList.add('user-message');

	messageContainer.setAttribute('contenteditable', 'true');

	messageContainer.innerText = message;

	let chatContainer = document.getElementById('chatContainer');

	chatContainer.appendChild(messageContainer);
	document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;

	if (newChat) {
		newChat = false;

		let chatHistoryListElement = {
			sessionID: currentChatHistroyId,
			name: 'Neuer Chat',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: message },
			],
		};
		createChathistoryElement(chatHistoryListElement, document.getElementById('chathistorysList'));
		addChathistoryEventListeners();
	}

	fetch('http://127.0.0.1:5000/api/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((data) => {
			let message = data;

			let messageContainer = document.createElement('span');

			messageContainer.classList.add('message');
			messageContainer.classList.add('ai-message');
			messageContainer.setAttribute('contenteditable', 'true');

			messageContainer.innerText = message;

			let chatContainer = document.getElementById('chatContainer');

			chatContainer.appendChild(messageContainer);

			chatContainer.scrollTop = chatContainer.scrollHeight;

			saveCurrentChathistorytoIndexedDb();
			addMessagesCloseEventListener();
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

function autoExpand(field) {
	// Zurücksetzen der Feldhöhe
	field.style.height = 'inherit';

	// Berechnen der Höhe
	var computed = window.getComputedStyle(field);
	var height =
		parseInt(computed.getPropertyValue('border-top-width'), 10) +
		parseInt(computed.getPropertyValue('padding-top'), 10) +
		field.scrollHeight +
		parseInt(computed.getPropertyValue('padding-bottom'), 10) +
		parseInt(computed.getPropertyValue('border-bottom-width'), 10);

	if (height > 120) {
		height = 120;
	}

	field.style.height = height - 10 + 'px';
}

function addSettingsEventListener() {
	document.querySelector('.switchSidebar').addEventListener('click', async function () {
		if (openSidebar) {
			document.querySelector('.sidebar').style.width = '53px';
			document.getElementById('switchSidebarImg').style.transform = 'rotate(180deg)';
			document.getElementById('sidebarSetting').style.display = 'none';
			openSidebar = false;
		} else {
			document.getElementById('switchSidebarImg').style.transform = 'rotate(0deg)';
			document.querySelector('.sidebar').style.width = '';
			await new Promise((r) => setTimeout(r, 100));
			document.getElementById('sidebarSetting').style.display = 'block';
			openSidebar = true;
		}
	});

	document.getElementById('chatInput').addEventListener(
		'input',
		function (event) {
			autoExpand(event.target);
		},
		false
	);

	document.getElementById('modelSelect').addEventListener('change', function (event) {
		console.log(event.target.value);

		if (event.target.value == 'gpt-3.5-turbo-1106') {
			document.getElementById('maxTokensInput').setAttribute('max', '16385');
		} else if (event.target.value == 'gpt-3.5-turbo') {
			document.getElementById('maxTokensInput').setAttribute('max', '4096');
		} else if (event.target.value == 'gpt-4') {
			document.getElementById('maxTokensInput').setAttribute('max', '8192');
		} else if (event.target.value == 'gpt-4-1106-preview') {
			document.getElementById('maxTokensInput').setAttribute('max', '128000');
		}

		let maxTokens = document.getElementById('maxTokensInput').value;

		let modelMaxTokens = document.getElementById('maxTokensInput').getAttribute('max');

		if (parseInt(maxTokens) > parseInt(modelMaxTokens)) {
			document.getElementById('maxTokensInput').value = modelMaxTokens;
		}
	});

	document.getElementById('maxTokensInput').addEventListener('change', function (event) {
		let maxTokens = event.target.value;

		let modelMaxTokens = document.getElementById('maxTokensInput').getAttribute('max');

		if (parseInt(maxTokens) > parseInt(modelMaxTokens)) {
			document.getElementById('maxTokensInput').value = modelMaxTokens;
			document.getElementById('tokenError').style.display = 'block';
		}

		setTimeout(function () {
			document.getElementById('tokenError').style.display = 'none';
		}, 1000);
	});

	const slider = document.getElementById('tempSlider');
	const output = document.getElementById('tempValue');

	// Aktualisieren Sie die Anzeige jedes Mal, wenn der Schieberegler bewegt wird
	slider.oninput = function () {
		output.textContent = this.value;
	};

	// Checks if Enter is pressed
	document.getElementById('chatInput').addEventListener('keyup', function (event) {
		event.preventDefault();
		if (event.key === 'Enter') {
			sendMessage();
		}
	});

	addMessagesCloseEventListener();

	document.getElementById('frequencyPenaltyInput').oninput = function () {
		let frequencyPenalty = event.target.value;

		document.getElementById('frequencyPenaltyValue').textContent = frequencyPenalty;
	};

	document.getElementById('topP').oninput = function () {
		let topP = event.target.value;

		document.getElementById('topPValue').textContent = topP;
	};
}

function addMessagesCloseEventListener() {
	// Wählen Sie alle Elemente aus, die das Pseudoelement enthalten
	var messageElements = document.querySelectorAll('.ai-message');

	// Fügen Sie jedem Element einen 'click' Event Listener hinzu
	messageElements.forEach(function (messageElement) {
		messageElement.addEventListener('click', function (event) {
			// Berechnen Sie die Position des Klicks relativ zum Element
			var clickX = event.clientX - messageElement.getBoundingClientRect().left;
			var clickY = event.clientY - messageElement.getBoundingClientRect().top;

			// Überprüfen Sie, ob der Klick in der Nähe der rechten oberen Ecke erfolgt ist
			var inAfterArea = clickX > messageElement.offsetWidth - 40 && clickY < 40;

			// Führen Sie eine Aktion aus, wenn das '::after' Pseudoelement geklickt wurde
			if (inAfterArea) {
				console.log('::after Pseudoelement wurde geklickt!');
				messageElement.remove();
				saveCurrentChathistorytoIndexedDb();
			}
		});
	});
	// Wählen Sie alle Elemente aus, die das Pseudoelement enthalten
	var messageElements = document.querySelectorAll('.user-message');

	// Fügen Sie jedem Element einen 'click' Event Listener hinzu
	messageElements.forEach(function (messageElement) {
		messageElement.addEventListener('click', function (event) {
			// Berechnen Sie die Position des Klicks relativ zum Element
			var clickX = event.clientX - messageElement.getBoundingClientRect().left;
			var clickY = event.clientY - messageElement.getBoundingClientRect().top;

			// Überprüfen Sie, ob der Klick in der Nähe der rechten oberen Ecke erfolgt ist
			var inAfterArea = clickX > messageElement.offsetWidth - 40 && clickY < 40;

			// Führen Sie eine Aktion aus, wenn das '::after' Pseudoelement geklickt wurde
			if (inAfterArea) {
				console.log('::after Pseudoelement wurde geklickt!');
				messageElement.remove();
				saveCurrentChathistorytoIndexedDb();
			}
		});
	});
}

function saveCurrentChathistorytoIndexedDb() {
	//save the Current Chathistory to IndexedDb with a sessionID

	//get the current Chathistory
	let messages = document.getElementsByClassName('message');
	let messagesArray = [];
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].classList.contains('user-message')) {
			messagesArray.push({ role: 'user', content: messages[i].innerText });
		} else if (messages[i].classList.contains('ai-message')) {
			messagesArray.push({ role: 'assistant', content: messages[i].innerText });
		}
	}

	let sessionID = currentChatHistroyId;

	//save the current Chathistory to IndexedDb
	let saveRequest = indexedDB.open('chathistory', 1);

	saveRequest.onerror = function (event) {
		console.log('error: ');
	};

	saveRequest.onsuccess = function (event) {
		let db = saveRequest.result;
		let transaction = db.transaction(['chathistory'], 'readwrite');
		let objectStore = transaction.objectStore('chathistory');

		let addRequest = objectStore.put({
			sessionID: sessionID,
			name: 'Neuer Chat',
			messages: messagesArray,
			systemPrompt: document.getElementById('systemPrompt').value,
			model: document.getElementById('modelSelect').value,
			temperature: document.getElementById('tempSlider').value,
			maxTokens: document.getElementById('maxTokensInput').value,
			seed: document.getElementById('seedInput').value,
			stopSequences: document.getElementById('stopSequencesInput').value,
			frequencyPenalty: document.getElementById('frequencyPenaltyInput').value,
			topP: document.getElementById('topP').value,
		});

		addRequest.onsuccess = function (event) {
			console.log('added to IndexedDb');
		};

		transaction.oncomplete = function (event) {
			db.close();
		};

		addRequest.onsuccess = function (event) {
			console.log('added to IndexedDb');
		};

		transaction.oncomplete = function (event) {
			db.close();
		};
	};

	saveRequest.onupgradeneeded = function (event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore('chathistory', { keyPath: 'sessionID' });
	};

	//save the sessionID to the localstorage
	localStorage.setItem('sessionID', sessionID);
}

function loadChathistoryfromIndexedDb(sessionID) {
	//load the Chathistory from IndexedDb with a sessionID

	//load the Chathistory from IndexedDb
	let dbRequest = indexedDB.open('chathistory', 1);

	dbRequest.onerror = function (event) {
		console.log('error: ');
	};

	dbRequest.onsuccess = function (event) {
		let db = dbRequest.result;
		let transaction = db.transaction(['chathistory'], 'readwrite');
		let objectStore = transaction.objectStore('chathistory');
		let getRequest = objectStore.get(sessionID);

		getRequest.onsuccess = function (event) {
			let messages = getRequest.result.messages;
			let chatContainer = document.getElementById('chatContainer');
			chatContainer.innerHTML = '';
			for (let i = 0; i < messages.length; i++) {
				let messageContainer = document.createElement('span');
				messageContainer.classList.add('message');
				if (messages[i].role == 'user') {
					messageContainer.classList.add('user-message');
				} else if (messages[i].role == 'assistant') {
					messageContainer.classList.add('ai-message');
				}
				messageContainer.setAttribute('contenteditable', 'true');
				messageContainer.innerText = messages[i].content;
				chatContainer.appendChild(messageContainer);
			}
			currentChatHistroyId = sessionID;

			// Set the values from IndexedDB to the input fields
			let chathistory = getRequest.result;
			document.getElementById('modelSelect').value = chathistory.model || 'gpt-3.5-turbo-1106';
			document.getElementById('systemPrompt').value = chathistory.systemPrompt || 'Du bist ein netter und Hilfreicher KI Assistent';
			document.getElementById('tempSlider').value = chathistory.temperature || 0.5;
			document.getElementById('maxTokensInput').value = chathistory.maxTokens || 1024;
			document.getElementById('seedInput').value = chathistory.seed || '';
			document.getElementById('stopSequencesInput').value = chathistory.stopSequences || '';
			document.getElementById('frequencyPenaltyInput').value = chathistory.frequencyPenalty || 0.0;
			document.getElementById('topP').value = chathistory.topP || 1.0;

			document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
		};

		transaction.oncomplete = function (event) {
			db.close();
		};
	};

	dbRequest.onupgradeneeded = function (event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore('chathistory', { keyPath: 'sessionID' });
	};
}

function loadChathistorysList() {
	// Load all Chathistorys from IndexedDb
	let dbRequest = indexedDB.open('chathistory', 1);

	dbRequest.onerror = function (event) {
		console.log('error: ');
	};

	dbRequest.onsuccess = function (event) {
		let db = dbRequest.result;
		let transaction = db.transaction(['chathistory'], 'readwrite');
		let objectStore = transaction.objectStore('chathistory');
		let getRequest = objectStore.getAll();

		getRequest.onsuccess = function (event) {
			let chathistorys = getRequest.result;
			let chathistorysList = document.getElementById('chathistorysList');
			chathistorysList.innerHTML = '';

			chathistorys.forEach(function (chathistory) {
				createChathistoryElement(chathistory, chathistorysList);
			});

			addChathistoryEventListeners();
		};

		transaction.oncomplete = function (event) {
			db.close();
		};
	};

	dbRequest.onupgradeneeded = function (event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore('chathistory', { keyPath: 'sessionID' });
	};
}

function createChathistoryElement(chathistory, chathistorysList) {
	let editspan = document.createElement('span');
	editspan.classList.add('chat-edit-icon');
	editspan.innerText = '✏️';

	let deleteSpan = document.createElement('span');
	deleteSpan.classList.add('chat-delete-icon');
	deleteSpan.innerText = '🗑️';

	let chathistoryContainer = document.createElement('div');
	chathistoryContainer.classList.add('chathistory');

	chathistoryContainer.setAttribute('sessionID', chathistory.sessionID);

	let text = chathistory.name || 'Neuer Chat';

	//replace all \n in the text

	text = text.replace(/(?:\r\n|\r|\n)/g, '');

	let pTag = document.createElement('p');
	pTag.innerText = text;
	pTag.style.margin = '0px';
	pTag.style.padding = '0px';
	pTag.style.height = 'fit-content';

	chathistoryContainer.appendChild(pTag);
	chathistoryContainer.appendChild(editspan);
	chathistoryContainer.appendChild(deleteSpan);
	chathistorysList.appendChild(chathistoryContainer);
}

function addChathistoryEventListeners() {
	var chathistoryElements = document.querySelectorAll('.chathistory');

	chathistoryElements.forEach(function (chathistoryElement) {
		chathistoryElement.addEventListener('click', function (event) {
			let sessionID = chathistoryElement.getAttribute('sessionID');
			loadChathistoryfromIndexedDb(sessionID);
		});
	}, false);

	document.querySelectorAll('.chat-edit-icon').forEach(function (icon) {
		icon.addEventListener('click', function (event) {
			event.stopPropagation();
			var chatItem = this.parentNode;
			var newName = prompt(
				'Bitte geben Sie den neuen Namen für den Chat ein:',
				chatItem.innerText.replace('✏️', '').replace('🗑️', '')
			);
			if (newName) {
				changeNameOfChathistoryInIndexedDb(chatItem.getAttribute('sessionID'), newName);
				chatItem.firstChild.textContent = newName;
			}
		});
	});

	document.querySelectorAll('.chat-delete-icon').forEach(function (icon) {
		icon.addEventListener('click', function (event) {
			event.stopPropagation();
			if (confirm('Möchten Sie diesen Chat wirklich löschen?')) {
				let sessionId = icon.parentElement.getAttribute('sessionID');
				deleteChathistoryFromIndexedDB(sessionId);
				this.parentNode.remove();
			}
		});
	});
}

function deleteChathistoryFromIndexedDB(sessionID) {
	//delete the Chathistory from IndexedDb with a sessionID

	//delete the Chathistory from IndexedDb
	let dbRequest = indexedDB.open('chathistory', 1);

	dbRequest.onerror = function (event) {
		console.log('error: ');
	};

	dbRequest.onsuccess = function (event) {
		let db = dbRequest.result;
		let transaction = db.transaction(['chathistory'], 'readwrite');
		let objectStore = transaction.objectStore('chathistory');
		let deleteRequest = objectStore.delete(sessionID);

		deleteRequest.onsuccess = function (event) {
			console.log('deleted from IndexedDb');
		};

		transaction.oncomplete = function (event) {
			db.close();
		};
	};

	dbRequest.onupgradeneeded = function (event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore('chathistory', { keyPath: 'sessionID' });
	};
}

function changeNameOfChathistoryInIndexedDb(sessionID, newName) {
	//change the Name of the Chathistory in IndexedDb with a sessionID

	//change the Name of the Chathistory in IndexedDb
	let dbRequest = indexedDB.open('chathistory', 1);

	dbRequest.onerror = function (event) {
		console.log('error: ');
	};

	dbRequest.onsuccess = function (event) {
		let db = dbRequest.result;
		let transaction = db.transaction(['chathistory'], 'readwrite');
		let objectStore = transaction.objectStore('chathistory');
		let getRequest = objectStore.get(sessionID);

		getRequest.onsuccess = function (event) {
			let chathistory = getRequest.result;
			chathistory.name = newName;
			let putRequest = objectStore.put(chathistory);

			putRequest.onsuccess = function (event) {
				console.log('changed name in IndexedDb');
			};
		};

		transaction.oncomplete = function (event) {
			db.close();
		};
	};

	dbRequest.onupgradeneeded = function (event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore('chathistory', { keyPath: 'sessionID' });
	};
}

function createNewChat() {
	currentChatHistroyId = generateNewChatHistoryId();

	document.getElementById('chatContainer').innerHTML = '';
	newChat = true;

	document.getElementById('modelSelect').value = 'gpt-3.5-turbo-1106';

	document.getElementById('systemPrompt').value = 'Du bist ein netter und Hilfreicher KI Assistent';

	document.getElementById('tempSlider').value = 0.5;

	document.getElementById('maxTokensInput').value = 1024;
}

// ! TODO: Add Language select with prompting

function regenerateResponse() {
	let lastElement = document.getElementById('chatContainer').lastChild;

	document.getElementById('dot-spinner').style.display = 'flex';

	if (lastElement.classList.contains('ai-message')) {
		lastElement.remove();
	}

	let systemPrompt = document.getElementById('systemPrompt').value;

	let messages = document.getElementsByClassName('message');
	let messagesArray = [];
	messagesArray.push({ role: 'system', content: systemPrompt });

	for (let i = 0; i < messages.length; i++) {
		if (messages[i].classList.contains('user-message')) {
			messagesArray.push({ role: 'user', content: messages[i].innerText });
		} else if (messages[i].classList.contains('ai-message')) {
			messagesArray.push({ role: 'assistant', content: messages[i].innerText });
		}
	}

	let model = document.getElementById('modelSelect').value;
	let maxTokens = document.getElementById('maxTokensInput').value;
	let temperature = document.getElementById('tempSlider').value;

	let seed = document.getElementById('seedInput')?.value;

	let sprache = document.getElementById('sprache').value;
	// Add the Previous Messages to the messages

	let spracheAbkürtungFullDict = {
		de: 'deutsch',
		en: 'englisch',
		es: 'spanisch',
		fr: 'französisch',
		it: 'italienisch',
		pt: 'portugiesisch',
		ru: 'russisch',
		zh: 'chinesisch',
	};

	let spracheAbkürzung = spracheAbkürtungFullDict[sprache];

	let languageTempSentence = '\nAntworte mir bitte auf ' + spracheAbkürzung + '.\n\n';

	messagesArray[messagesArray.length - 1].content = messagesArray[messagesArray.length - 1].content + languageTempSentence;

	let data = {
		messages: messagesArray,
		model: model,
		maxTokens: maxTokens,
		temperature: temperature,
		seed: seed,
		stop: null,
		top_p: null,
		frequency_penalty: null,
	};

	document.getElementById('chatInput').value = '';

	fetch('http://127.0.0.1:5000/api/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((data) => {
			let message = data;

			let messageContainer = document.createElement('span');

			messageContainer.classList.add('message');
			messageContainer.classList.add('ai-message');
			messageContainer.setAttribute('contenteditable', 'true');

			messageContainer.innerText = message;

			let chatContainer = document.getElementById('chatContainer');

			chatContainer.appendChild(messageContainer);

			chatContainer.scrollTop = chatContainer.scrollHeight;
			document.getElementById('dot-spinner').style.display = 'none';
			saveCurrentChathistorytoIndexedDb();

			addMessagesCloseEventListener();
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}
