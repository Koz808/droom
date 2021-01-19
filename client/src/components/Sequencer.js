import React, { useContext, useEffect, useState } from 'react'
import { Step } from './Step';
import '../style/sequencer.scss'
import * as Brain from '../tone/main';
import { v4 } from 'uuid';
import SocketAPIContext, { socket } from '../api'

function Sequencer ({buttonColor, instrument}) {

  const [numSteps, setNumSteps] = useState(32);
  const roomId = useContext(SocketAPIContext);

  useEffect(() => {
    socket.on(`pattern-change`, ([inst, patNum, note]) => {
      // console.log('');
      if (inst === instrument) {
          Brain.changeSynthPattern(note, inst, patNum); //! event should say which pattern to change
        if (patNum === Brain.instrumentState[instrument].visiblePattern) {
          buttonToggleActive(note);
        }
      }
    });
  }, []);

  function buttonToggleActive (note) {

    const thisNote = document.querySelector(`.${instrument} .step${note.stepNum}.${note.noteID.replace('#', '\\#')}`);
    console.log(`TRYING TO FIND ELEMENT::  .${instrument} .step${note.stepNum}.${note.noteID.replace('#', '\\#')}`)
    thisNote.classList.toggle('active');
    // thisNote.classList.toggle(buttonColor);
    thisNote.classList.toggle('inactive');
  }

  function handleNoteClick (note) {
    if (note.stepNum >= 0) {
      socket.emit(`pattern-change`, [instrument, Brain.instrumentState[instrument].visiblePattern, note, roomId]);
      buttonToggleActive(note);
      //! this should set notes on the currently visible pattern
      try {
        Brain.changeSynthPattern(note, instrument, Brain.instrumentState[instrument].visiblePattern);
      } catch (error) {
        buttonToggleActive(note);
        console.error(`Cound not change pattern. note:${note}, instrument:${instrument}, Brain.instrumentState[instrument].visiblePattern:${Brain.instrumentState[instrument].visiblePattern}`)
      }
    } else Brain.synths[instrument].triggerAttackRelease(Brain.scales[instrument][note.noteID], '16n');
  }

  function renderSteps (num, noSequence) {

    //!renders before scale is created
    const arr = [];
    for (let i = 0; i < num; i++) {
      arr.push(<Step
        handleNoteClick={handleNoteClick}
        pattern={Brain.instrumentState[instrument].patterns[Brain.instrumentState[instrument].visiblePattern]}//! IS THIS REDUNDANT?
        stepNum={noSequence ? -1 : i}
        shape="grid"
        noteNames={Object.values(Brain.scales[instrument])}
        buttonColor={buttonColor}
        key={v4()} />);
    }
    return arr;
  }

  return (
    <div className="piano-roll">
      <div className="piano">
        {renderSteps(1, true)}
      </div>
      <div className="sequencer">
        {renderSteps(numSteps)}
      </div>
    </div>

  )
}

export default Sequencer
