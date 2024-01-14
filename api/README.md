# Python Backend

## Installation

1. (optional) venv erstellen

2. Installiere die erforderlichen Pakete:

```sh
pip install -r requirements.txt
```

## Verwendung

Führe die Anwendung aus:

```sh
python run.py
```

## API Reference

#### Chat

```http
  POST /api/chat
```

| Parameter           | Type     | Description                                                                              |
| :------------------ | :------- | :--------------------------------------------------------------------------------------- |
| `messages`          | `List`   | **Required**. Liste an Chat Nachrichten                                                  |
| `model`             | `String` | **Erforderlich**. Das Modell, das für die API-Anfrage verwendet wird                     |
| `maxTokens`         | `Int`    | **Erforderlich**. Maximale Anzahl von Tokens, die in der Antwort generiert werden können |
| `temperature`       | `Float`  | **Erforderlich**. Steuert die Zufälligkeit der Antwort                                   |
| `stop`              | `String` | Optional. Zeichenfolge, bei deren Auftreten die Antwortgenerierung gestoppt wird         |
| `top_p`             | `Float`  | Optional. Steuert die Diversität der Antwort. Standardwert ist 1                         |
| `frequency_penalty` | `Float`  | Optional. Straft häufige Wörter ab, um die Vielfalt zu erhöhen. Standardwert ist 0       |
| `seed`              | `Int`    | Optional. Seed für die Zufälligkeitssteuerung der Antwortgenerierung                     |
