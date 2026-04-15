export const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

export const DEFAULT_TEMPLATES: Array<{
  title: string;
  role: string;
  content: string;
  isDefault: boolean;
}> = [
  {
    title: 'Streszczenie zarządcze',
    role: 'Podsumowujący',
    content:
      'Przekształć dostarczony dokument w zwięzłe streszczenie zarządcze. ' +
      'Struktura odpowiedzi:\n' +
      '1. Jednozdaniowe podsumowanie (czego dotyczy dokument).\n' +
      '2. Kluczowe punkty (3-5 punktów obejmujących najważniejsze fakty, decyzje lub wnioski).\n' +
      '3. Działania do podjęcia lub wnioski końcowe (jeśli istnieją).\n' +
      'Używaj prostego języka biznesowego. Unikaj żargonu. Bądź zwięzły — streszczenie powinno być czytelne w mniej niż 2 minuty.',
    isDefault: false,
  },
  {
    title: 'Prawo po ludzku',
    role: 'Tłumacz prawny',
    content:
      'Przetłumacz dostarczony tekst prawny na prosty, codzienny język zrozumiały dla każdego. ' +
      'Zasady:\n' +
      '- Zastąp wszystkie terminy prawnicze i zwroty łacińskie prostymi odpowiednikami.\n' +
      '- Rozbij długie zdania na krótkie i jasne.\n' +
      '- Wyjaśnij, co każdy punkt lub sekcja oznacza w praktyce dla czytelnika.\n' +
      '- Podkreśl wszelkie obowiązki, prawa, terminy lub ryzyka, o których czytelnik powinien wiedzieć.\n' +
      '- Nie pomijaj ważnych szczegółów — upraszczaj język, nie znaczenie.',
    isDefault: false,
  },
  {
    title: 'Technologia dla laika',
    role: 'Tłumacz techniczny',
    content:
      'Wyjaśnij dostarczone treści techniczne osobie bez wiedzy technicznej. ' +
      'Wytyczne:\n' +
      '- Używaj codziennych analogii do wyjaśniania pojęć technicznych.\n' +
      '- Unikaj skrótów; jeśli musisz użyć skrótu, natychmiast go zdefiniuj.\n' +
      '- Skup się na tym, co technologia robi i dlaczego jest ważna, a nie na tym, jak działa wewnętrznie.\n' +
      '- Struktura wyjaśnienia: czym to jest → dlaczego jest ważne → co czytelnik powinien wiedzieć lub zrobić.\n' +
      '- Zachowaj przyjazny i przystępny ton.',
    isDefault: true,
  },
];
export const MAX_FILE_COUNT = 5;
export const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ALLOWED_EXTENSIONS = new Map<string, string>([
  ['pdf', 'application/pdf'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['txt', 'text/plain'],
  ['md', 'text/markdown'],
  ['csv', 'text/csv'],
]);
export const TEXT_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
