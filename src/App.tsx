import React, { useEffect, useState } from 'react';
import './App.css';
import Dropzone from "react-dropzone";
import { parse } from 'csv-parse/browser/esm/sync';

function shuffle(array: any[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function App() {
  const [questions, setQuestions] = useState<string[][][]>([]);
  const [filename, setFilename] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionsPerExam, setQuestionsPerExam] = useState(10);
  const [numExams, setNumExams] = useState(450);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [intro, setIntro] = useState('Bienvenide a este examen completamente automatizado.');

  useEffect(() => {
    setFilename(file?.name ?? '')
  }, [file]);

  useEffect(() => {
    (async () => {
      const records = parse(await file?.text() ?? ``, {
        columns: false,
        skip_empty_lines: true
      });
      const qs = Array.from({ length: numExams }, (x, i) => i).map(() => {
        shuffle(records)
        return records.slice(0, questionsPerExam).map((record: string[]) => {
          if (shuffleAnswers) {
            const answers = record.splice(1);
            shuffle(answers);
            record.splice(1, 0, ...answers);
          }
          return record;
        })
      });
      setQuestions(qs)
    })()
  }, [file, questionsPerExam, numExams, shuffleAnswers])
  return (
    <div className="App">
      <div className="noprint">
        <p>Cantidad de preguntas por examen: <input type="number" value={questionsPerExam} onChange={(e) => setQuestionsPerExam(parseInt(e.target.value, 10))} /></p>
        <p>Cantidad de examenes: <input type="number" value={numExams} onChange={(e) => setNumExams(parseInt(e.target.value, 10))} /></p>
        <p>Aleatorizar respuestas: <input type="checkbox" checked={shuffleAnswers} onChange={(e) => setShuffleAnswers(!shuffleAnswers)} /></p>
        <p>Texto para poner al inicio de cada examen: <textarea value={intro} onChange={(e) => setIntro(e.target.value)}></textarea></p>
        <Dropzone onDrop={(acceptedFiles) => setFile(acceptedFiles[0] || null)}>
          {({ getRootProps, getInputProps }) => (
            <section style={{ border: "3px dashed #333", borderRadius: 5 }}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>
                  {filename.length === 0
                    ? `Tirá un archivo acá (tiene que ser un csv con pregunta,respuesta1,respuesta2,respuesta3<enter>pregunta2,respuesta...)`
                    : filename}
                </p>
              </div>
            </section>
          )}
        </Dropzone>
      </div>
      {questions.map((qs, i) => (
        <div className="exam" key={i}>
          <p>Tema {i + 1}</p>
          <p>{intro}</p>
          <ol>
            {qs.map((q, j) => (
              <li key={j}>
                {q[0]}
                <ol>
                  {q.slice(1).map((a, k) => <li key={k}>{a}</li>)}
                </ol>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default App;
