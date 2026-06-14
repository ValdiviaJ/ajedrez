import React from 'react';
import './App.css';

// Diccionario de piezas de ajedrez estilizadas como SVGs inline para una apariencia premium vectorizada e interactiva
export const ChessPieces = {
  wp: (
    <svg viewBox="0 0 45 45" className="chess-piece white">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-.83 1.15-1.41 2.53-1.41 4.97H28c0-2.44-.58-3.82-1.41-4.97C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#00f0ff" strokeWidth="1.5" />
    </svg>
  ),
  wr: (
    <svg viewBox="0 0 45 45" className="chess-piece white">
      <path d="M9 39h27v-3H9v3zm3-13v10h21V26H12zm2.5-3l1.5-4h18l1.5 4h-21zM9 12v3h3v-3H9zm9 0v3h3v-3h-3zm9 0v3h3v-3h-3zm9 0v3h3v-3h-3z" fill="#fff" stroke="#00f0ff" strokeWidth="1.5" />
    </svg>
  ),
  wn: (
    <svg viewBox="0 0 45 45" className="chess-piece white">
      <path d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,23 13,23 C 13,23 14,20 18,20 C 18,20 17,21 15,24 C 13,27 13,31 16,34 C 18,36 22,36 24,34 C 26,32 27,29 27,25 C 27,21 28,18 29,17 C 30,16 31,16 31,16 C 31,16 29,14 27,14 C 25,14 23,12 22,10 z" fill="#fff" stroke="#00f0ff" strokeWidth="1.5" />
    </svg>
  ),
  wb: (
    <svg viewBox="0 0 45 45" className="chess-piece white">
      <path d="M9 36c3.39 0 7.66-.69 11.5-2.33 3.84 1.64 8.11 2.33 11.5 2.33h2v-3h-2c-3.64 0-7.31-.86-10.5-2.5 3.19-1.64 6.86-2.5 10.5-2.5h2v-3h-2c-3.39 0-7.66.69-11.5 2.33C16.66 28.69 12.39 28 9 28H7v3h2c3.64 0 7.31.86 10.5 2.5C16.31 35.14 12.64 36 9 36H7v3h2z" fill="#fff" stroke="#00f0ff" strokeWidth="1.5" />
    </svg>
  ),
  wq: (
    <svg viewBox="0 0 45 45" className="chess-piece white">
      <path d="M9 26c0 2 1.5 3.5 3.5 3.5h20c2 0 3.5-1.5 3.5-3.5S34.5 22.5 32.5 22.5h-20C10.5 22.5 9 24 9 26zm3-13.5L18 30h9l6-17.5L28 20l-5.5-12L17 20l-5-7.5z" fill="#fff" stroke="#00f0ff" strokeWidth="1.5" />
    </svg>
  ),
  wk: (
    <svg viewBox="0 0 45 45" className="chess-piece white">
      <path d="M22.5 11.63V6M19.69 8.44h5.62M22.5 25c5.52 0 10-4.48 10-10S28.02 5 22.5 5 12.5 9.48 12.5 15s4.48 10 10 10zm-9 14h18M18 35h9m-11.25-6h13.5" fill="#fff" stroke="#00f0ff" strokeWidth="1.5" />
    </svg>
  ),
  bp: (
    <svg viewBox="0 0 45 45" className="chess-piece black">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-.83 1.15-1.41 2.53-1.41 4.97H28c0-2.44-.58-3.82-1.41-4.97C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#140a2d" stroke="#ff007f" strokeWidth="1.5" />
    </svg>
  ),
  br: (
    <svg viewBox="0 0 45 45" className="chess-piece black">
      <path d="M9 39h27v-3H9v3zm3-13v10h21V26H12zm2.5-3l1.5-4h18l1.5 4h-21zM9 12v3h3v-3H9zm9 0v3h3v-3h-3zm9 0v3h3v-3h-3zm9 0v3h3v-3h-3z" fill="#140a2d" stroke="#ff007f" strokeWidth="1.5" />
    </svg>
  ),
  bn: (
    <svg viewBox="0 0 45 45" className="chess-piece black">
      <path d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,23 13,23 C 13,23 14,20 18,20 C 18,20 17,21 15,24 C 13,27 13,31 16,34 C 18,36 22,36 24,34 C 26,32 27,29 27,25 C 27,21 28,18 29,17 C 30,16 31,16 31,16 C 31,16 29,14 27,14 C 25,14 23,12 22,10 z" fill="#140a2d" stroke="#ff007f" strokeWidth="1.5" />
    </svg>
  ),
  bb: (
    <svg viewBox="0 0 45 45" className="chess-piece black">
      <path d="M9 36c3.39 0 7.66-.69 11.5-2.33 3.84 1.64 8.11 2.33 11.5 2.33h2v-3h-2c-3.64 0-7.31-.86-10.5-2.5 3.19-1.64 6.86-2.5 10.5-2.5h2v-3h-2c-3.39 0-7.66.69-11.5 2.33C16.66 28.69 12.39 28 9 28H7v3h2c3.64 0 7.31.86 10.5 2.5C16.31 35.14 12.64 36 9 36H7v3h2z" fill="#140a2d" stroke="#ff007f" strokeWidth="1.5" />
    </svg>
  ),
  bq: (
    <svg viewBox="0 0 45 45" className="chess-piece black">
      <path d="M9 26c0 2 1.5 3.5 3.5 3.5h20c2 0 3.5-1.5 3.5-3.5S34.5 22.5 32.5 22.5h-20C10.5 22.5 9 24 9 26zm3-13.5L18 30h9l6-17.5L28 20l-5.5-12L17 20l-5-7.5z" fill="#140a2d" stroke="#ff007f" strokeWidth="1.5" />
    </svg>
  ),
  bk: (
    <svg viewBox="0 0 45 45" className="chess-piece black">
      <path d="M22.5 11.63V6M19.69 8.44h5.62M22.5 25c5.52 0 10-4.48 10-10S28.02 5 22.5 5 12.5 9.48 12.5 15s4.48 10 10 10zm-9 14h18M18 35h9m-11.25-6h13.5" fill="#140a2d" stroke="#ff007f" strokeWidth="1.5" />
    </svg>
  )
};
