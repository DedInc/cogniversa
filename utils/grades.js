const time = require('./time.js');


function calculateTypeSpeed(startTime, text) {
  const endTime = time.getUnix();
  const typeTime = endTime - startTime;

  return Math.round(text.length / typeTime);
}


function calculateTypingTime(text, charsPerSecond) {
  const typingTime = text.length / charsPerSecond;
  const thinkingTime = typingTime * 0.3;

  return (typingTime + thinkingTime).toFixed(2);
}


function calculateTypeGrade(typedTime, maxTime) {
  return Math.max(Math.min(maxTime / typedTime, 1), 0).toFixed(2);
}


function calculateStringsRatio(s1, s2) {
  const [longer, shorter] = s1.length >= s2.length ? [s1, s2] : [s2, s1];
  const longerLength = longer.length;

  if (longerLength === 0) return 1.0;

  const matchedCount = Array.from(shorter)
    .filter((character, index) => character === longer[index])
    .length;

  return (matchedCount / longerLength).toFixed(2);
}


function calculateTotalGrade(grades) {
  grades = grades.map(grade => +grade);
  grades.sort((a, b) => a - b);

  let median;
  let midIndex = Math.floor(grades.length / 2);

  if (grades.length % 2 === 0) {
    median = (grades[midIndex - 1] + grades[midIndex]) / 2.0;
  } else {
    median = grades[midIndex];
  }

  return Math.min(median.toFixed(2), 1.0);
}


module.exports = {
  calculateTypeSpeed,
  calculateTypingTime,
  calculateTypeGrade,
  calculateStringsRatio,
  calculateTotalGrade
};