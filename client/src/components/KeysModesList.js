import React, { useState, useEffect } from 'react'
import { Scale, Mode } from '@tonaljs/tonal';
import * as Brain from '../tone/main';
import { v4 } from 'uuid';
import { socket } from '../api';
import '../style/keysModesList.scss'

export function KeysModesList ({buttonColor}) {

  const [scale, setScale] = useState(localStorage.getItem('droom-keys-scale') || 'C');
  const [mode, setMode] = useState(localStorage.getItem('droom-keys-mode') ||'ionian');

  useEffect(() => {
    // sendNewScale();
    Brain.setNewScale('lead', createScale());
    Brain.setNewScale('bass', createBassScale());
  }, [scale, mode]);

  useEffect(() => {
    // Brain.createLoop(createScale());
    socket.on('key-change', (key) => {
      setScale(key);
      localStorage.setItem('droom-keys-scale', key);
    });
    socket.on('mode-change', (mode) => {
      setMode(mode);
      localStorage.setItem('droom-keys-mode', mode);
    });
  }, []);

  function createScale () {
    return Scale.rangeOf(`${scale} ${mode}`)(`${scale}2`, `${scale}6`);
  }

  function createBassScale () {
    return Scale.rangeOf(`${scale} ${mode}`)(`${scale + Brain.bassFirstOctave}`, `${scale + (Brain.bassFirstOctave + Brain.bassNumOctaves)}`);
  }

  function renderScales (arr) {
    return arr.map((note) => {
      return <input
        className={`list-item grid ${note === scale ? 'active '+buttonColor : ''}`}
        type="button" value={note}
        onClick={() => handleScaleClick(note)}
        key={v4()} />
    })
  }

  function renderModes (arr) {
    return arr.map((note) => {
      return <input
        className={`list-item grid ${note === mode ? 'active ' + buttonColor : ''}`}
        type="button" value={note}
        onClick={()=>handleModeClick(note)}
        key={v4()} />
    })
  };

  function handleScaleClick (key) {
    socket.emit('key-change', key);
    setScale(key);
    localStorage.setItem('droom-keys-scale', key);
  }

  function handleModeClick (mode) {
    socket.emit('mode-change', mode)
    setMode(mode);
    localStorage.setItem('droom-keys-mode', mode);
  }

  return (
    <div className="scales-container">
      <div className="scales-modes-container">
        <div className="scales list-grid">
          {renderScales(Scale.scaleNotes(Scale.rangeOf('C chromatic')('C1', 'B1')), 'scale')}
        </div>
        <div className="modes list-grid">
          {renderModes(Mode.names(), 'mode')}
        </div>
      </div>
      <div className="scales-tab">Select key / mode</div>
    </div>
  )
}
