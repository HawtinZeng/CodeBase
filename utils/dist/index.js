'use strict';

function sumAsciiValues(str) {
  let sum = 0;
  for (let char of str) {
    sum += char.charCodeAt(0);
  }
  return sum;
}

exports.sumAsciiValues = sumAsciiValues;
