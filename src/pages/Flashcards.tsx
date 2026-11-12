import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import FlashcardsModel from '../flashcards/FlashcardsModel.ts';
import '../styles/flashcards.css';

const builtInFlashcards = import.meta.glob<string>(
  '../assets/flashcardFiles/*.txt',
  { eager: true, query: '?raw', import: 'default' },
);

type FileSource = 'upload' | 'built-in';

function Flashcards() {
  const [model] = useState(() => new FlashcardsModel());
  const [fileSource, setFileSource] = useState<FileSource>('upload');
  const [selectedBuiltInFile, setSelectedBuiltInFile] = useState('');
  const [title, setTitle] = useState('Flashcards');
  const [cardText, setCardText] = useState('');
  const [pileCounts, setPileCounts] = useState<number[]>(
    () => Array(FlashcardsModel.PILE_COUNT).fill(0),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const updatePileCounts = useCallback(() => {
    setPileCounts(
      Array.from(
        { length: FlashcardsModel.PILE_COUNT },
        (_, pile) => model.getPileSize(pile),
      ),
    );
  }, [model]);

  const flipCard = useCallback(() => {
    setCardText(model.flipCard() ?? '');
  }, [model]);

  const answerCard = useCallback((correct: boolean) => {
    model.answered(correct);
    setCardText(model.getNextCard());
    updatePileCounts();
  }, [model, updatePileCounts]);

  async function loadCards(file: File) {
    setIsLoading(true);
    setError('');

    try {
      const firstCard = await model.populateCards(file);
      setTitle(file.name.replace(/\.txt$/i, ''));
      setCardText(firstCard);
      updatePileCounts();
    } catch (loadError) {
      const details = loadError instanceof Error ? loadError.message : String(loadError);
      setError(`Unable to read this file: ${details}`);
      setCardText('');
      updatePileCounts();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    function handleKeyUp(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName))
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'e':
        case ' ':
          event.preventDefault();
          flipCard();
          break;
        case 'w':
          event.preventDefault();
          answerCard(false);
          break;
        case 'r':
          event.preventDefault();
          answerCard(true);
          break;
      }
    }

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [answerCard, flipCard]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = '';

    if (file == null) {
      return;
    }

    await loadCards(file);
  }

  async function handleBuiltInFileChange(event: ChangeEvent<HTMLSelectElement>) {
    const path = event.currentTarget.value;
    setSelectedBuiltInFile(path);

    if (!path) {
      return;
    }

    const contents = builtInFlashcards[path];
    if (contents === undefined) {
      setError(`Unable to find the built-in flashcards file: ${path}`);
      return;
    }

    const name = path.split('/').at(-1);
    if (!name) {
      setError(`Unable to determine the built-in flashcards filename: ${path}`);
      return;
    }

    await loadCards(new File([contents], name, { type: 'text/plain' }));
  }

  const hasCards = pileCounts.some((count) => count > 0);
  const builtInFiles = Object.keys(builtInFlashcards).sort((a, b) => a.localeCompare(b));

  return (
    <main className="flashcards-page">
      <header className="flashcards-heading">
        <h1>{title}</h1>
      </header>

      <div className="flashcards-layout">
        <section className="flashcards-file" aria-label="Flashcard file">
          <b>Flashcards File</b>
          <select
            className="flashcards-select"
            id="flashcards-source"
            value={fileSource}
            onChange={(event) => {
              let filePrompt = document.getElementById('filePrompt');
              if (filePrompt) {
                filePrompt.style.visibility = event.currentTarget.value === 'built-in' ? 'hidden' : 'visible';
              }
              setFileSource(event.currentTarget.value === 'built-in' ? 'built-in' : 'upload');
            }}
            disabled={isLoading}
          >
            <option value="upload">Upload</option>
            <option value="built-in">Premade</option>
          </select>

          {fileSource === 'upload' ? (
            <>
              <input
                ref={fileInput}
                className="flashcards-file-input"
                type="file"
                accept=".txt,text/plain"
                tabIndex={-1}
                aria-hidden="true"
                onChange={handleFileChange}
              />
              <button
                className="flashcards-button"
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? 'Loading…' : 'Choose file'}
              </button>
            </>
          ) : (
            <label htmlFor="built-in-flashcards" className="flashcards-select-label">
              <select
                className="flashcards-select"
                id="built-in-flashcards"
                value={selectedBuiltInFile}
                onChange={handleBuiltInFileChange}
                disabled={isLoading || builtInFiles.length === 0}
              >
                <option className="flashcards-file-option" value="">
                  {builtInFiles.length > 0 ? 'Select a file' : 'No files available'}
                </option>
                {builtInFiles.map((path) => {
                  const name = path.split('/').at(-1) ?? path;
                  return (
                    <option className="flashcards-file-option" key={path} value={path}>
                      {name.replace(/\.txt$/i, '')}
                    </option>
                  );
                })}
              </select>
            </label>
          )}
          <p id="filePrompt" className="flashcards-file-prompt">Files (.txt is easiest) should have one card per line, front & back separated by a tilde (~).{'\n'}
            <a href="https://github.com/henrysnider/henrysnider.github.io/blob/main/src/assets/flashcardFiles/Research%20Methods%20Midterm%201.txt" target="_blank">Example</a>
          </p>
        </section>

        <section className="flashcards-study" aria-label="Flashcard">
          <button
            className="flashcards-card"
            type="button"
            onClick={flipCard}
            disabled={!hasCards || isLoading}
            aria-label="Flip flashcard"
          >
            {hasCards ? cardText : 'Choose a flashcards file to begin'}
          </button>
          {error && <p className="flashcards-error" role="alert">{error}</p>}
          {!error && hasCards && (
            <p className="flashcards-shortcuts">
              Click the card or press E / Space to flip
            </p>
          )}
        </section>

        <section className="flashcards-piles" aria-label="Cards in each pile">
          <b>Pile Card Counts</b>
          {pileCounts.map((count, pile) => (
            <div className="flashcards-pile" key={pile}>
              <span>Pile {pile}</span>
              <span>{count}</span>
            </div>
          ))}
        </section>
      </div>

      <footer className="flashcards-controls">
        <button
          className="flashcards-button"
          type="button"
          onClick={() => answerCard(false)}
          disabled={!hasCards || isLoading}
        >
          Incorrect <kbd>W</kbd>
        </button>
        <button
          className="flashcards-button"
          type="button"
          onClick={() => answerCard(true)}
          disabled={!hasCards || isLoading}
        >
          Correct <kbd>R</kbd>
        </button>
      </footer>
    </main>
  );
}

export default Flashcards;