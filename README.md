# Mein Projekt

Dieses Projekt besteht aus zwei Hauptteilen: der [`api`](api 'api') und der [`web`](web 'web')-Anwendung.

## API

Die API ist in Python geschrieben und verwendet Flask. Sie finden den Code in [`api/app`](api/app 'api/app').

Die Hauptdateien sind:

-   [`routes.py`](api/app/routes.py 'api/app/routes.py'): Hier sind die Routen für die API definiert.
-   [`__init__.py`](api/app/__init__.py 'api/app/__init__.py'): Hier wird die Flask-Anwendung initialisiert.

Die .env Datei muss unter `api/.env` gespeichert sein

#### Benötigt

-   OPENAI_API_KEY=sk-3G**\*\*\*\***\*\*\*\***\*\*\*\***

Die Abhängigkeiten für die API sind in [`requirements.txt`](api/requirements.txt 'api/requirements.txt') aufgeführt.

#### Start

Um die API zu starten, führen Sie [`run.py`](api/run.py 'api/run.py') aus.

## Web-Anwendung

Die Web-Anwendung besteht aus HTML, CSS und JavaScript. Sie finden den Code in [`web`](web 'web').

Die Hauptdateien sind:

-   [`index.html`](index.html 'web/index.html'): Die Hauptseite der Web-Anwendung.
-   [`css/styles.css`](styles.cs 'web/css/styles.css'): Die CSS-Styles für die Web-Anwendung.
-   [`js/script.js`](script.js 'web/js/script.js'): Das JavaScript für die Web-Anwendung.

Die Web-Anwendung verwendet die Open Sans Schriftart, die Sie in [`web/font`](web/font 'web/font') finden.

## .gitignore

Die [`.gitignore`](.gitignore '.gitignore') Datei enthält eine Liste von Dateitypen, die von Git ignoriert werden sollen. Dies sind in der Regel temporäre oder generierte Dateien, die nicht in das Repository aufgenommen werden sollten.

## Weiterführende Informationen

Für weitere Informationen lesen Sie bitte die README-Dateien in den jeweiligen Verzeichnissen:

-   [API README](api/README.md 'api/README.md')
-   [WEB README](web/README.md 'web/README.md')
