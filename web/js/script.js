let openSidebar = true;

addSettingsEventListener();

function sendMessage() {
	let message = document.getElementById('chatInput').value;

	if (message == '') {
		return;
	}

	let systemPrompt = document.getElementById('systemPrompt').innerText;

	let messages = [{ role: 'system', content: systemPrompt }];

	let model = document.getElementById('modelSelect').value;
	let maxTokens = document.getElementById('maxTokensInput').value;
	let temperature = document.getElementById('tempSlider').value;

	let seed = document.getElementById('seedInput')?.value;

	let messagesContainer = document.getElementsByClassName('message');
	// Add the Previous Messages to the messages

	try {
		for (let i = 0; i < messagesContainer.length; i++) {
			if (messagesContainer[i].classList.contains('user')) {
				messages.push({ role: 'user', content: messagesContainer[i].innerText });
			} else if (messagesContainer[i].classList.contains('assistant')) {
				messages.push({ role: 'assistant', content: messagesContainer[i].innerText });
			}
		}
	} catch (error) {}

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

	messageContainer.innerText = message;

	let chatContainer = document.getElementById('chatContainer');

	chatContainer.appendChild(messageContainer);

	fetch('http://127.0.0.1:5000/api/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((data) => {
			let message = data.messages[0].content;

			let messageContainer = document.createElement('span');

			messageContainer.classList.add('message');
			messageContainer.classList.add('ai-message');

			messageContainer.innerText = message;

			let chatContainer = document.getElementById('chatContainer');

			chatContainer.appendChild(messageContainer);

			chatContainer.scrollTop = chatContainer.scrollHeight;
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
		if (event.key === 'Enter') {
			sendMessage();
		}
	});
}
