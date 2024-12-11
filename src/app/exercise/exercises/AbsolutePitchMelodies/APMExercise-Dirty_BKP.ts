import * as _ from 'lodash';
import { Note } from 'tone/Tone/core/type/NoteUnits';
import Exercise from '../../exercise-logic';
import {
  DeepReadonly,
  NotesRange,
  randomFromList,
  ScaleDegree,
  getScaleDegreeFromNote,
  toNoteName,
  toNoteNumber,
  Interval,
} from '../../utility';
import { NoteType } from '../../utility/music/notes/NoteType';
import { NoteNumber } from '../../utility/music/notes/NoteNumberOrName';
import { getNoteOctave } from '../../utility/music/notes/getNoteOctave';
import { noteTypeToNote } from '../../utility/music/notes/noteTypeToNote';
import { transpose } from '../../utility/music/transpose';
import { composeExercise } from '../utility/exerciseAttributes/composeExercise';
import { createExercise } from '../utility/exerciseAttributes/createExercise';
import {
  IncludedAnswersSettings,
  includedAnswersSettings,
} from '../utility/settings/IncludedAnswersSettings';
import { playWrongAnswerSettings } from '../utility/settings/PlayWrongAnswerSettings';
import { APMExerciseExplanationComponent } from './apm-exercise-explanation/apm-exercise-explanation.component';
import AnswerList = Exercise.AnswerList;

export type NoteName = // cria tipo nome de notas NoteName
  | 'C'
  | 'C#/Db'
  | 'D'
  | 'D#/Eb'
  | 'E'
  | 'F'
  | 'F#/Gb'
  | 'G'
  | 'G#/Ab'
  | 'A'
  | 'A#/Bb'
  | 'B';

export type NoteDescriptor = {//Define um novo Type
  name: NoteName;
  noteNumber: number;
  absNote: NoteType;
};

export type IntervalExerciseSettings = IncludedAnswersSettings<NoteName> & {//Nao vou usar
  intervalType: 'melodic' | 'harmonic';
};

export const noteDescriptorList: DeepReadonly<NoteDescriptor[]> = [//Define um numero para a nota
  {
    name: 'C',
    noteNumber: 0,
	absNote: 'C',
  },
  {
    name: 'C#/Db',
    noteNumber: 1,
	absNote: 'C#',
  },
  {
    name: 'D',
    noteNumber: 2,
	absNote: 'D',
  },
  {
    name: 'D#/Eb',
    noteNumber: 3,
	absNote: 'D#',
  },
  {
    name: 'E',
    noteNumber: 4,
	absNote: 'E',
  },
  {
    name: 'F',
    noteNumber: 5,
	absNote: 'F',
  },
  {
    name: 'F#/Gb',
    noteNumber: 6,
	absNote: 'F#',
  },
  {
    name: 'G',
    noteNumber: 7,
	absNote: 'G',
  },
  {
    name: 'G#/Ab',
    noteNumber: 8,
	absNote: 'G#',
  },
  {
    name: 'A',
    noteNumber: 9,
	absNote: 'A',
  },
  {
    name: 'A#/Bb',
    noteNumber: 10,
	absNote: 'A#',
  },
  {
    name: 'B',
    noteNumber: 11,
	absNote: 'B',
  },
];

const noteNameToIntervalDescriptor: Record<
  NoteName,
  NoteDescriptor
> = _.keyBy(noteDescriptorList, 'name') as Record<
  NoteName,
  NoteDescriptor
>;

export const APMExercise = () => {
  const allAnswersList: AnswerList<NoteName> = {//cria list de repostas possiveis
    rows: [
      ['C', 'C#/Db','D','D#/Eb','E','F','F#/Gb','G','G#/Ab','A','A#/Bb','B'],      
    ].map((row: NoteName[]) =>//mapea cada item da linha em um NoteName
      row.map((note: NoteName) => {
        return {
          answer: note,
        };
      }),
    ),
  };
  const range = new NotesRange('C2', 'C6');

  return composeExercise(
    includedAnswersSettings({
      name: 'NoteNames',
    }),
    () => ({
      settingsDescriptors: [//nao irei usar?
        {
          key: 'intervalType',
          info: 'Whether two notes are played sequentially or simultaneously.',
          descriptor: {
            label: 'Interval Type',
            controlType: 'select',
            options: [
              {
                label: 'Melodic',
                value: 'melodic',
              },
              {
                label: 'Harmonic',
                value: 'harmonic',
              },
            ],
          },
        },
      ],
    }),
    playWrongAnswerSettings(),
    createExercise,
  )({
    id: 'noteNames',
    name: 'NoteNames',
    summary: 'Identify note names',
    explanation: APMExerciseExplanationComponent,//mudar depois
    getQuestion(
      settings: IntervalExerciseSettings,//Nao devo usar
    ): Exercise.Question<NoteName> {
	  
		
      const randomNoteDescriptor: NoteDescriptor = randomFromList(//busca uma nota aleatorio dentro dos selecionados, retorna o proprio IntervalDescriptor (.name seria uma property), posso tirar o AbsNote daqui
        noteDescriptorList.filter((noteDescriptor) =>
          settings.includedAnswers.includes(noteDescriptor.name),
        ),
      );
      const randomStartingNoteNumber: NoteNumber = _.random(
        range.lowestNoteNumber,
        range.highestNoteNumber - randomNoteDescriptor.noteNumber,//gera o NoteNumber de uma nota aleatoria dentro das notas  selecionadas
      );
	  
	
	  
	  
	  //MY Stuff
	  /*
	  const randomAbsNote: NoteDescriptor = randomFromList(
		  noteDescriptorList.filter((noteDescriptor) =>
			settings.includedAnswers.includes(noteDescriptor.name),
		  ),
		);
		
	  const qNote: NoteType = randomFromList(
		  noteDescriptorList.filter((noteDescriptor) =>
			settings.includedAnswers.includes(noteDescriptor.absNote),
		  ),
		);
	  
	    const randomOctave: number = _.random(1,6);
		
		//qNotePlay = noteTypeToNote(qNote, randomOctave);
        */
	  //End My Stuff
	  
	  
	  
	  
	  
      let lowNoteName = toNoteName(randomStartingNoteNumber);//converte de numero para o nome da Nota -> Aqui tenho uma nota aleatoria com oitava (ex. A3), posso retirar a oitava daqui
      let highNoteName = toNoteName(
        randomStartingNoteNumber + randomNoteDescriptor.noteNumber,
      );
	  
      let [startNoteName, endNoteName] = _.shuffle([lowNoteName, highNoteName]);
      function getPartFromNotes(start: Note, end: Note) {
        return settings.intervalType === 'melodic'
          ? [{ notes: start }, { notes: end }]
          : [{ notes: [start, end] }];
      }
	  
	  //let octaveNumber = getNoteOctave(qnote);
	  let octaveNumber = getNoteOctave(lowNoteName);//retiro a oitava
	  
	   //Junta Nota + Oitava
	 
	  let qnote = noteTypeToNote(randomNoteDescriptor.absNote, octaveNumber);//essa nota esta dentro das possiveis da selecao do usuario
	  
	  
		//Define Resolution Melody
	  
	  const qscaleDegree: ScaleDegree = getScaleDegreeFromNote('C', qnote);//achar o grau da nota da questao em relacao a C
	   
  	  let myresolution: Note[] = [];
	  let myresolutionInNoteTypes: NoteType[] = [];
	   
	  
	  if (qscaleDegree === '1'){
	   myresolutionInNoteTypes = ['C','C','E','G','A#','C']; //1135b71 
	  }
	  if (qscaleDegree === '2'){
	   myresolutionInNoteTypes = ['D','D','F','C','A','D']; //113b751
	  }
	  if (qscaleDegree === '3'){
	   myresolutionInNoteTypes = ['E', 'E', 'B', 'G#', 'D', 'E']; //1153b71
	  }
	  if (qscaleDegree === '4'){
	   myresolutionInNoteTypes = ['F', 'F', 'C', 'D#', 'A', 'F']; //115b731
	  }
	  if (qscaleDegree === '5'){
	   myresolutionInNoteTypes = ['G', 'G', 'F', 'B', 'D', 'G']; //11b7351
	  }
	  if (qscaleDegree === '6'){
	   myresolutionInNoteTypes = ['A', 'A', 'G', 'E', 'C#', 'A']; //11b7531
	  }
	  if (qscaleDegree === '7'){
	   myresolutionInNoteTypes = ['B', 'D#', 'F#', 'B', 'A','B']; //1351b71
	  }
	  myresolution = myresolutionInNoteTypes.map((noteType) =>
          noteTypeToNote(noteType, octaveNumber), //Converts each NoteType in resolutionInNoteTypes to a specific Note, preserving the octave determined earlier.
        );
	//Tranpose notes
	if (qscaleDegree === '2'){
	myresolution[3] = transpose( myresolution[3], Interval.Octave,);
	}
	if (qscaleDegree === '3'){
	myresolution[4] = transpose( myresolution[4], Interval.Octave,);
	}
	if (qscaleDegree === '4'){
	myresolution[2] = transpose( myresolution[2], Interval.Octave,),
	myresolution[3] = transpose( myresolution[3], Interval.Octave,);		
	}
	if (qscaleDegree === '5'){
	myresolution[2] = transpose( myresolution[2], Interval.Octave,),
	myresolution[4] = transpose( myresolution[4], Interval.Octave,);		
	}
	if (qscaleDegree === '6'){
	myresolution[2] = transpose( myresolution[2], Interval.Octave,),
	myresolution[3] = transpose( myresolution[3], Interval.Octave,),		
	myresolution[4] = transpose( myresolution[4], Interval.Octave,);
	}
	if (qscaleDegree === '7'){
	myresolution[1] = transpose( myresolution[1], Interval.Octave,),
	myresolution[2] = transpose( myresolution[2], Interval.Octave,),		
	myresolution[4] = transpose( myresolution[4], Interval.Octave,);
	}
	/*
	///START ORIGINAL FUNCION
      let [startNoteName, endNoteName] = _.shuffle([lowNoteName, highNoteName]);
      function getPartFromNotes(start: Note, end: Note) {
        return settings.intervalType === 'melodic'
          ? [{ notes: start }, { notes: end }]
          : [{ notes: [start, end] }];
      }
	  ///END ORIGINAL FUNCION
	  */
	  //const partToPlay = getPartFromNotes(startNoteName, endNoteName);
	  //THIS WORKS
	  /*
	  const part = [
	  {notes: myresolution[0]}, {notes: myresolution[3]}
	  ];
	  */
	  const part = myresolution.map((note, index) => ({
		  notes: note,
		  
		  duration:
                index === 0
                  ? '8n'
                  : index === myresolution.length - 1 || index === 2
                    ? '4n'
                    : '8n',
		}));
      return {
        segments: [
		
          {
            
			rightAnswer: randomNoteDescriptor.name,//A resposta e o nome da nota
            partToPlay: part,
			
			/*
            playOnWrong: (wrongInterval) => {
              const isAscending =
                toNoteNumber(startNoteName) < toNoteNumber(endNoteName);
              const direction = isAscending ? 1 : -1;
              const wrongEndNoteName = transpose(
                startNoteName,
                noteNameToIntervalDescriptor[wrongInterval].noteNumber *
                  direction,
              );

              return getPartFromNotes(startNoteName, wrongEndNoteName);
			  					 
            },
			*/
			
          },
        ],/*
        info: {
          beforeCorrectAnswer: `Note: ${endNoteName}  ?`,
          afterCorrectAnswer: `Notes played: ${startNoteName} - ${endNoteName}`,
		  
		  afterCorrectAnswer:[
			{
			  partToPlay: [
				{
				  notes: qnote,
				  duration:'2n',
				},
			  ],
			},
			], 
		  
        },*/
		
      };
	  afterCorrectAnswer:[
			{
			  partToPlay: [
				{
				  notes: qnote,
				  duration:'2n',
				},
			  ],
			},
			]; 
    },
    answerList: allAnswersList,
    defaultSettings: {
      intervalType: 'melodic',
    },
  });
};
