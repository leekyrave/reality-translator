# 🧠 Zadania Hackathonowe: „Enter the AI Future” 2026

## 🚀 Projekt: **AI-Kumpel: Most do przyszłości**

## 🎯 1. Cel projektu
Zbuduj prototyp **aplikacji webowej lub mobilnej**, która wykorzystuje sztuczną inteligencję do przekształcania nieustrukturyzowanych danych wejściowych w konkretną wartość użytkową. System musi zapewniać bezpieczne przetwarzanie danych, inteligentną interpretację kontekstu oraz odporność na błędy wejścia (data hygiene).

---

## ⚙️ 2. Katalog wyzwań (Wybierz jedno z zadań)

### _**Ważne! Finalna aplikacja musi działać na modelach udostępnianych przez Organizatora Hackathonu (Bielik 11B V3.0, Gemma4:e4b, Gemma4:26B).**_

### **1. Inteligentny Nawigator Urzędowy**
* **Wejście:** Plik graficzny (zdjęcie tabliczki informacyjnej, drzwi biura lub planu piętra).
* **Zadanie:** Automatyczne rozpoznanie tekstu oraz semantyczna interpretacja przeznaczenia danego miejsca (np. rozpoznanie kompetencji urzędnika na podstawie opisu na drzwiach).
* **Wyzwanie:** Minimalizacja opóźnień (latency) oraz integracja z silnikiem syntezy mowy (TTS), aby wynik był dostępny w czasie rzeczywistym dla osób niedowidzących lub obcokrajowców.
* **Wyjście:** Interfejs webowy prezentujący zinterpretowany komunikat w formie tekstowej i dźwiękowej.

### **2. Strażnik Estetyki Miasta**
* **Wejście:** Dane wizualne przedstawiające incydent (np. graffiti, uszkodzona infrastruktura, nielegalne odpady).
* **Zadanie:** Automatyczna klasyfikacja problemu do odpowiedniej kategorii urzędowej oraz analiza priorytetu zgłoszenia.
* **Wyzwanie:** Skuteczna detekcja wielu obiektów na jednym zdjęciu oraz wizualizacja zgłoszeń na interaktywnej mapie z uwzględnieniem statusów.
* **Wyjście:** Dashboard administracyjny z automatycznie wygenerowaną kolejką zgłoszeń i mapą incydentów.

### **3. Asystent Przedsiębiorcy „Kielecki Ekspres”**
* **Wejście:** Baza nieustrukturyzowanych dokumentów PDF (regulaminy, uchwały rady miasta, wielostronicowe tabele dotacji).
* **Zadanie:** System inteligentnego wnioskowania (Question Answering) działający wyłącznie w oparciu o dostarczony kontekst dokumentowy.
* **Wyzwanie:** Bezbłędna interpretacja danych zawartych w tabelach oraz całkowita eliminacja halucynacji – każda odpowiedź musi zawierać bezpośredni cytat oraz numer paragrafu/strony jako źródło.
* **Wyjście:** Interfejs czatu z funkcją podglądu źródłowego fragmentu dokumentu.

### **4. Nawigator Umysłu (Mood Pattern Analysis)**
* **Wejście:** Dane tekstowe (codzienne wpisy użytkownika, notatki głosowe, dziennik aktywności).
* **Zadanie:** Identyfikacja długoterminowych wzorców nastroju i korelacji między zdarzeniami a samopoczuciem użytkownika.
* **Wyzwanie:** Zastosowanie zaawansowanej logiki analizy trendów w czasie (nie tylko pojedynczych zdań) przy jednoczesnej redakcji danych wrażliwych (PII).
* **Wyjście:** Interaktywny wykres dobrostanu z modułem personalizowanych mikro-rekomendacji.

### **5. Tłumacz Rzeczywistości (Semantic Adaptation)**
* **Wejście:** Skomplikowany tekst źródłowy (pismo procesowe, artykuł naukowy, zawiły regulamin prawny, procedura medyczna itp.).
* **Zadanie:** Automatyczna parafraza i uproszczenie języka pod kątem wybranego profilu odbiorcy (np. dziecka, seniora lub osoby spoza branży). Należy zbierać feedback użytkowników, czy odpowiedź była zrozumiała dla odbiorcy
* **Wyzwanie:** Zachowanie pełnej esencji merytorycznej i faktograficznej dokumentu przy drastycznym obniżeniu progu trudności słownictwa.
* **Wyjście:** Webowy edytor prezentujący tekst oryginalny obok wersji zaadaptowanej (uproszczonej).

---

## 📦 3. Wymagane elementy dokumentacji

Wszystkie materiały dokumentacyjne muszą zostać umieszczone w katalogu **`/docs`** w głównym folderze repozytorium.

#### **🎥 I. Film demonstracyjny (`/docs/demo.*`)**
* **Format:** Krótki materiał wideo bez dźwięku (pokaz techniczny).
* **Zawartość:** Prezentacja pełnego cyklu pracy aplikacji (End-to-End): od wprowadzenia danych (upload pliku lub wpisanie tekstu) przez proces przetwarzania, aż po końcowy wynik wygenerowany przez AI.

#### **📄 II. Testy jakościowe modeli AI (`/docs/evaluation.md`)**
* Opis i wyniki testów jakości modeli


#### **📄 III. Dokumentacja API (`/docs/openapi.yaml` lub `.json`)**
* Pełna specyfikacja wszystkich punktów końcowych (endpoints) systemu w standardzie **OpenAPI / Swagger**.

#### **🧪 IV. Dokumentacja techniczna (`/docs/README.md`)**
Osobny plik dokumentacji (niezależny od głównego README projektu), zawierający:
* **Architekturę systemu:** Wykaz wykorzystanych modeli AI (lokalnych/API), bibliotek oraz schemat przepływu danych.
* **Instrukcję uruchomienia:** Precyzyjne kroki niezbędne do postawienia środowiska i obsługi zależności.
* **Bezpieczeństwo i Walidacja:** Opis mechanizmów ochrony danych (walidacja typów wejściowych, wykrywanie anomalii, redakcja PII).
* **Testy:** Dokumentacja przeprowadzonych testów jednostkowych lub integracyjnych potwierdzających poprawność logiki biznesowej.

---

## 🐳 4. Nice to have: Konteneryzacja
Możliwość uruchomienia całego stacku technologicznego (Frontend, Backend, AI Gateway) jedną komendą:
```bash
docker-compose up
```

---

## 📌 5. Zasady pracy z repozytorium

* 📂 **Ocenie podlega wyłącznie gałąź główna (`master`)**.
* 🕒 **Wymagany jest widoczny postęp prac w commitach**:
    * **Commity muszą być dodawane regularnie** w trakcie 12-godzinnej sesji hackathonu.
    * **Zabrania się** przesyłania całego projektu w jednym commicie na zakończenie prac.
* 🛠️ **Struktura**: Wszystkie wymagane dokumenty (demo, OpenAPI, ewaluacja, README) muszą znajdować się w katalogu `/docs`.

---

### **🚀 Do dzieła!**
**Pokonajcie ograniczenia sprzętowe, okiełznajcie lokalne modele i stwórzcie coś, co naprawdę ułatwi życie mieszkańcom. Powodzenia – niech prompt będzie z Wami! 🔥**

---

# 🧠 Hackathon Tasks: "Enter the AI Future" 2026

## 🚀 Project: **AI-Buddy: A Bridge to the Future**

## 🎯 1. Project Objective
Build a prototype of a **web or mobile application** that leverages Artificial Intelligence to transform unstructured input data into concrete practical value. The system must ensure secure data processing, intelligent context interpretation, and resistance to input errors (data hygiene).

---

## ⚙️ 2. Challenge Catalog (Choose one task)

### _**Important! The final application must run on the models provided by the Organizer (Bielik 11B V3.0, Gemma4:e4b, Gemma4:26B).**_

### **1. Intelligent Public Office Navigator**
* **Input:** An image file (photo of an information plaque, office door, or floor plan).
* **Task:** Automatic text recognition and semantic interpretation of the location's purpose (e.g., identifying an official's competencies based on the description on the door).
* **Challenge:** Minimizing latency and integrating with a Text-to-Speech (TTS) engine so the result is accessible in real-time for visually impaired users or foreigners.
* **Output:** A web interface presenting the interpreted message in both text and audio formats.

### **2. Urban Aesthetic Guardian**
* **Input:** Visual data representing an incident (e.g., graffiti, damaged infrastructure, illegal waste).
* **Task:** Automatic classification of the issue into the appropriate administrative category and priority analysis.
* **Challenge:** Effective multi-object detection within a single photo and visualization of reports on an interactive map with status tracking.
* **Output:** An administrative dashboard with an automatically generated task queue and incident map.

### **3. "Kielce Express" Business Assistant**
* **Input:** A database of unstructured PDF documents (regulations, city council resolutions, multi-page grant tables).
* **Task:** An intelligent Question Answering (QA) system operating strictly based on the provided document context.
* **Challenge:** Flawless interpretation of data contained in tables and total elimination of hallucinations – every answer must include a direct quote and a paragraph/page number as a source.
* **Output:** A chat interface with a feature to preview the source fragment of the document.

### **4. Mind Navigator (Mood Pattern Analysis)**
* **Input:** Text data (daily user entries, voice notes, activity logs).
* **Task:** Identification of long-term mood patterns and correlations between events and user well-being.
* **Challenge:** Applying advanced time-series trend analysis logic (beyond single sentences) while ensuring the redaction of Personally Identifiable Information (PII).
* **Output:** An interactive well-being chart with a personalized micro-recommendations module.

### **5. Reality Translator (Semantic Adaptation)**
* **Input:** Complex source text (legal pleadings, scientific articles, intricate regulations, medical procedures, etc.).
* **Task:** Automatic paraphrase and simplification of language tailored to a specific audience profile (e.g., a child, a senior, or a person outside the industry). Collect user feedback on whether the response was understandable.
* **Challenge:** Maintaining the full substantive and factual essence of the document while drastically lowering the vocabulary difficulty threshold.
* **Output:** A web editor presenting the original text alongside the adapted (simplified) version.

---

## 📦 3. Required Documentation Elements

All documentation materials must be placed in the **`/docs`** directory in the root folder of the repository.

#### **🎥 I. Demonstration Video (`/docs/demo.*`)**
* **Format:** A short video without audio (technical demo).
* **Content:** Presentation of the full End-to-End application cycle: from data input (file upload or text entry) through the processing stage, to the final result generated by the AI.

#### **📄 II. AI Model Quality Tests (`/docs/evaluation.md`)**
* Description and results of the model quality benchmarks.

#### **📄 III. API Documentation (`/docs/openapi.yaml` or `.json`)**
* Full specification of all system endpoints using the **OpenAPI / Swagger** standard.

#### **🧪 IV. Technical Documentation (`/docs/README.md`)**
A separate documentation file (independent of the project's main README) containing:
* **System Architecture:** A list of utilized AI models (local/API), libraries, and a data flow diagram.
* **Deployment Instructions:** Precise steps required to set up the environment and handle dependencies.
* **Security and Validation:** Description of data protection mechanisms (input type validation, anomaly detection, PII redaction).
* **Testing:** Documentation of unit or integration tests confirming the correctness of the business logic.

---

## 🐳 4. Nice to have: Containerization
The ability to launch the entire technology stack (Frontend, Backend, AI Gateway) with a single command:
```bash
docker-compose up
```


## 📌 5. Repository Rules

* 📂 **Only the main branch (`master`) will be evaluated.**
* 🕒 **Visible progress in commits is required:**
    * **Commits must be added regularly** throughout the 12-hour hackathon session.
    * **It is forbidden** to push the entire project in a single commit at the end of the event.
* 🛠️ **Structure:** All required documents (demo, OpenAPI, evaluation, README) must be located in the `/docs` directory.