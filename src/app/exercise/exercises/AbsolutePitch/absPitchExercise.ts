import * as _ from 'lodash';
import { Note } from 'tone/Tone/core/type/NoteUnits';
import Exercise from '../../exercise-logic';
import {
  DeepReadonly,
  Interval,
  NotesRange,
  ScaleDegree,
  SolfegeNote,
  getDiatonicScaleDegreeWithAccidental,
  getResolutionFromScaleDegree,
  getScaleDegreeFromNote,
  randomFromList,
  scaleDegreeToSolfegeNote,
  solfegeNoteToScaleDegree,
  toNoteNumber,
} from '../../utility';
import { NoteType } from '../../utility/music/notes/NoteType';
import { getNoteOctave } from '../../utility/music/notes/getNoteOctave';
import { getNoteType } from '../../utility/music/notes/getNoteType';
import { noteTypeToNote } from '../../utility/music/notes/noteTypeToNote';
import { noteTypeToScaleDegree } from '../../utility/music/scale-degrees/noteTypeToScaleDegree';
import { scaleDegreeToNoteType } from '../../utility/music/scale-degrees/scaleDegreeToNoteType';
import { transpose } from '../../utility/music/transpose';
import { composeExercise } from '../utility/exerciseAttributes/composeExercise';
import { createExercise } from '../utility/exerciseAttributes/createExercise';
import {
  IMelodicQuestion,
  MelodicDictationExerciseSettings,
  melodicExercise,
} from '../utility/exerciseAttributes/melodicDictationExercise';
import { TonalExerciseUtils } from '../utility/exerciseAttributes/tonalExercise';
import {
  IncludedAnswersSettings,
  includedAnswersSettings,
} from '../utility/settings/IncludedAnswersSettings';
import {
  NumberOfSegmentsSetting,
  numberOfSegmentsControlDescriptorList,
} from '../utility/settings/NumberOfSegmentsSetting';
import {
  PlayAfterCorrectAnswerSetting,
  playAfterCorrectAnswerControlDescriptorList,
} from '../utility/settings/PlayAfterCorrectAnswerSetting';
import { absPitchExplanationComponent } from './absPitch-explanation/absPitch-explanation.component';

export type APitchSettings = IncludedAnswersSettings<SolfegeNote> &
  MelodicDictationExerciseSettings &
  NumberOfSegmentsSetting &
  PlayAfterCorrectAnswerSetting & {
    notesRange: 'high' | 'middle' | 'bass' | 'contrabass';
    numberOfVoices: 1 | 2 | 3;
    harmonicIntervals: ('1' | '2' | '3' | '4' | '4#' | '5' | '6' | '7' | '8')[];
  };

export function absPitchExercise() {
  const rangeOptionToNotesRange: {
    [range in APitchSettings['notesRange']]: NotesRange;
  } = {
    high: new NotesRange('C4', 'G6'),
    middle: new NotesRange('G2', 'E4'),
    bass: new NotesRange('A1', 'C3'),
    contrabass: new NotesRange('Eb1', 'Eb2'),
  };

  const voiceRangeGap: Interval = Interval.MajorThird;

  function getSolfegeNoteOfNoteInC(note: Note): SolfegeNote {
    return scaleDegreeToSolfegeNote[
      noteTypeToScaleDegree(getNoteType(note), 'C')
    ];
  }

  return composeExercise(
    melodicExercise(),
    includedAnswersSettings<SolfegeNote>({
      defaultSelectedAnswers: ['Do', 'Re', 'Mi'],
      name: 'Absolute Pitch',
    }),
    createExercise,
  )({
    id: 'aPitch',
    name: `Absolute Pitch`,
    summary: `Identify Absolute Pitches based on Melody Triggers (reaseach only)`,
    explanation: absPitchExplanationComponent,
    getMelodicQuestionInC(
      settings: APitchSettings,
      tonalExerciseUtils: TonalExerciseUtils,
    ): IMelodicQuestion {
      function getNoteOptionsFromRange(notesRange: NotesRange): Note[] {
        const rangeForKeyOfC: NotesRange =
          tonalExerciseUtils.getRangeForKeyOfC(notesRange);
        return rangeForKeyOfC
          .getAllNotes()
          .filter((questionOption) =>
            settings.includedAnswers.includes(
              getSolfegeNoteOfNoteInC(questionOption),
            ),
          );
      }

      const notesRange: NotesRange =
        rangeOptionToNotesRange[settings.notesRange];
      // if we want to add more voices below, we need to limit how low the top voice can go
      const topVoiceRange: NotesRange = new NotesRange(
        transpose(
          notesRange.lowestNoteName,
          voiceRangeGap * (settings.numberOfVoices - 1),
        ),
        notesRange.highestNoteName,
      );
      const noteOptions: Note[] = getNoteOptionsFromRange(topVoiceRange);
      let randomNotesInC: Note[] = Array.from(
        Array(settings.numberOfSegments),
      ).map(() => randomFromList(noteOptions));
      const randomQuestionInC: Note[][] = [randomNotesInC];

      const permittedHarmonicIntervals: Interval[] = _.flatMap(
        settings.harmonicIntervals,
        (interval) => {
          switch (interval) {
            case '1':
              return [Interval.Unison];
            case '2':
              return [Interval.MinorSecond, Interval.MajorSecond];
            case '3':
              return [Interval.MinorThird, Interval.MajorThird];
            case '4':
              return [Interval.PerfectFourth];
            case '4#':
              return [Interval.AugmentedForth];
            case '5':
              return [Interval.PerfectFifth];
            case '6':
              return [Interval.MinorSixth, Interval.MajorSixth];
            case '7':
              return [Interval.MinorSeventh, Interval.MajorSeventh];
            case '8':
              return [Interval.Octave];
          }
        },
      );
      let currentVoiceRange: NotesRange = notesRange;
      while (randomQuestionInC.length < settings.numberOfVoices) {
        const lastVoice = _.last(randomQuestionInC)!;
        currentVoiceRange = transpose(currentVoiceRange, -voiceRangeGap);
        const noteOptionsForLowerVoice: Note[] =
          getNoteOptionsFromRange(currentVoiceRange);
        const lowerVoice = lastVoice.map((note: Note) => {
          const options: Note[] = noteOptionsForLowerVoice.filter((option) => {
            const interval: number = toNoteNumber(note) - toNoteNumber(option);
            // since all intervals are positive, this also verifies the new voice is lower
            return permittedHarmonicIntervals.includes(interval);
          });
          if (_.isEmpty(options)) {
            console.error(
              `No options for note ${note} in range ${currentVoiceRange.lowestNoteName} - ${currentVoiceRange.highestNoteName}`,
            );
            options.push(note);
          }
          return randomFromList(options);
        });
        randomQuestionInC.push(lowerVoice);
      }
	  
	  //Define Resolution Melody
	  const qnote: Note = randomNotesInC[0];
	  const qscaleDegree: ScaleDegree = getScaleDegreeFromNote('C', qnote);
	  	 
  	  let myresolution: Note[] = [];
	  let myresolutionInNoteTypes: NoteType[] = [];
	  let octaveNumber = getNoteOctave(qnote);
	  if (qscaleDegree === '1'){
	   myresolutionInNoteTypes = ['C','C','E','G','A#','C']; //1135b71 
	  }
	  if (qscaleDegree === 'b2'){
	   myresolutionInNoteTypes = ['C#','F','C#','G#','B','C#']; //1315b71
	  }
	  if (qscaleDegree === '2'){
	   myresolutionInNoteTypes = ['D','D','F','C','A','D']; //113b751
	  }
	  if (qscaleDegree === 'b3'){ 
	   myresolutionInNoteTypes = ['D#','F#','D#','C#','A#','D#']; //131b751
	  }
	  if (qscaleDegree === '3'){
	   myresolutionInNoteTypes = ['E', 'E', 'B', 'G#', 'D', 'E']; //1153b71
	  }
	  if (qscaleDegree === '4'){
	   myresolutionInNoteTypes = ['F', 'F', 'C', 'D#', 'A', 'F']; //115b731
	  }
	  if (qscaleDegree === '#4'){
	   myresolutionInNoteTypes = ['F#',  'C#', 'F#','E', 'A#', 'F#']; //151b731
	  }
	  if (qscaleDegree === '5'){
	   myresolutionInNoteTypes = ['G', 'G', 'F', 'B', 'D', 'G']; //11b7351
	  }
	  if (qscaleDegree === 'b6'){
	   myresolutionInNoteTypes = ['G#',  'F#', 'G#','C', 'D#', 'G#']; //1b7135
	  }
	  if (qscaleDegree === '6'){
	   myresolutionInNoteTypes = ['A', 'A', 'G', 'E', 'C#', 'A']; //11b7531
	  }
	  if (qscaleDegree === 'b7'){
	   myresolutionInNoteTypes = ['A#',  'G#', 'A#','F', 'D', 'A#']; //1b71531
	  }
	  if (qscaleDegree === '7'){
	   myresolutionInNoteTypes = ['B', 'D#', 'F#', 'B', 'A','B']; //1351b71
	  }
	  myresolution = myresolutionInNoteTypes.map((noteType) =>
          noteTypeToNote(noteType, octaveNumber), //Converts each NoteType in resolutionInNoteTypes to a specific Note, preserving the octave determined earlier.
        );
	//Tranpose notes
	if (qscaleDegree === '2' || qscaleDegree === 'b3'){
	myresolution[3] = transpose( myresolution[3], Interval.Octave,);
	}
	if (qscaleDegree === '3'){
	myresolution[4] = transpose( myresolution[4], Interval.Octave,);
	}
	if (qscaleDegree === '4'){
	myresolution[2] = transpose( myresolution[2], Interval.Octave,),
	myresolution[3] = transpose( myresolution[3], Interval.Octave,);		
	}
	if (qscaleDegree === '#4'){
	myresolution[1] = transpose( myresolution[1], Interval.Octave,),
	myresolution[3] = transpose( myresolution[3], Interval.Octave,);		
	}
	if (qscaleDegree === '5'){
	myresolution[2] = transpose( myresolution[2], Interval.Octave,),
	myresolution[4] = transpose( myresolution[4], Interval.Octave,);		
	}
	if (qscaleDegree === 'b6' || qscaleDegree === 'b7'){
	myresolution[1] = transpose( myresolution[1], Interval.Octave,),
	myresolution[3] = transpose( myresolution[3], Interval.Octave,),		
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
	}/*
	myresolution.map((note, index) => ({
          partToPlay: [
            {
              notes: note,
              duration:
                index === 0
                  ? '8n'
                  : index === myresolution.length - 1
                    ? '4n'
                    : '8n',
            },
          ],        
        }));
	*/

	//Play Melody
	
	return { 
		//toplay:	
		//myresolution,
        segments: randomQuestionInC,		
        afterCorrectAnswer: myresolution.map((note, index) => ({
          partToPlay: [
            {
              notes: note,
              duration:
                index === 0
                  ? '2n'
                  : index === myresolution.length - 1
                    ? '2n'
                    : '8n',
            },
          ],
        //  answerToHighlight: getSolfegeNoteOfNoteInC(note),
        })), 
	}
	  
	//THIS almost works
	/*
	  return { 	    
        segments: myresolution,
        afterCorrectAnswer:[
		{
          partToPlay: [
            {
              notes: randomNotesInC,
              duration:'2n',
            },
          ],
        },
		],      
      }*/
    },
    settingsDescriptors: [
      {
        key: 'displayMode',
        info: 'Choose how the scale degrees are noted. <br>(This setting will apply only after you close the settings page.)',
        descriptor: {
          label: 'Display',
          controlType: 'select',
          options: [
            {
              label: 'Numbers',
              value: 'numeral',
            },
            {
              label: 'Movable-Do',
              value: 'solfege',
            },
          ],
        },
      },
      {
        key: 'notesRange',
        info: 'Choose how high or low the notes will be played',
        descriptor: ((): Exercise.SelectControlDescriptor<
          APitchSettings['notesRange']
        > => {
          return {
            controlType: 'select',
            label: 'Range',
            options: [
              {
                label: 'High',
                value: 'high',
              },
              {
                label: 'Middle',
                value: 'middle',
              },
              {
                label: 'Bass',
                value: 'bass',
              },
              {
                label: 'Contra Bass',
                value: 'contrabass',
              },
            ],
          };
        })(),
      },
      ...numberOfSegmentsControlDescriptorList('notes'),
      {
        key: 'numberOfVoices',
        info: 'Choose how many notes will be played simultaneously',
        descriptor: {
          label: 'Number of voices',
          controlType: 'slider',
          min: 1,
          max: 3,
          step: 1,
        },
      },
      {
        show: (settings: APitchSettings) => settings.numberOfVoices > 1,
        key: 'harmonicIntervals',
        info:
          'Choose which intervals can be played harmonically (between voices)\n' +
          'Note that the intervals are tonal, so 3<sup>rd</sup> can be both a major 3<sup>rd</sup> and a minor 3<sup>rd</sup>.',
        descriptor: {
          label: 'Harmonic Intervals',
          controlType: 'included-answers',
          /**
           * Note here it's not really "answers" but we are still using the same component,
           * this should be renamed to be more generic
           * */
          answerList: {
            rows: [
              [
                {
                  answer: '1',
                  displayLabel: '1<sup>st</sup>',
                },
                {
                  answer: '2',
                  displayLabel: '2<sup>nd</sup>',
                },
                {
                  answer: '3',
                  displayLabel: '3<sup>rd</sup>',
                },
                {
                  answer: '4',
                  displayLabel: '4<sup>th</sup>',
                },
                {
                  answer: '4#',
                  displayLabel: 'aug4<sup>th</sup>',
                },
                {
                  answer: '5',
                  displayLabel: '5<sup>th</sup>',
                },
                {
                  answer: '6',
                  displayLabel: '6<sup>th</sup>',
                },
                {
                  answer: '7',
                  displayLabel: '7<sup>th</sup>',
                },
                {
                  answer: '8',
                  displayLabel: '8<sup>th</sup>',
                },
              ],
            ],
          },
        },
      },
      ...playAfterCorrectAnswerControlDescriptorList({
        show: (settings: APitchSettings) =>
          settings.numberOfSegments === 1 && settings.numberOfVoices === 1,
      }),
    ],
    defaultSettings: {
      numberOfSegments: 1,
      numberOfVoices: 1,
      playAfterCorrectAnswer: true,
      notesRange: 'middle',
      displayMode: 'solfege',
      harmonicIntervals: ['3', '4', '5', '6', '8'],
	  playCadence: false,
    },
  });
}
