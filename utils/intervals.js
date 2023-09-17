const time = require('./time.js');

const intervals = [1, 3, 7, 14, 30, 60, 120, 240];

function isReviseViolated(learnDate, reviseDates) {
    for (let i = 0; i < reviseDates.length; i++) {
        let current_date;
        if (i === 0) {
            current_date = learnDate;
        } else {
            current_date = reviseDates[i - 1];
        }

        let daysSinceLearning = (time.getUnix() - learnDate) / 86400;
        let daysSinceRevision = (reviseDates[i] - learnDate) / 86400;
        let daysSinceLearningToRevision = daysSinceLearning - daysSinceRevision;

        for (let interval of intervals) {
            if (daysSinceRevision > Math.round(interval + interval / 3)) {
                return true;
            }
        }
    }
    return false;
}

function needRevise(learnDate, reviseDate) {
    let current_date = time.getUnix();
    let daysSinceLearning = (current_date - learnDate) / 86400;
    let daysSinceLastRevision = (current_date - reviseDate) / 86400;
    let daysSinceLearningToRevision = daysSinceLearning - daysSinceLastRevision;

    let current_interval = 0;
      
    for (let interval of intervals) {
        if (daysSinceLearningToRevision <= interval) {
            current_interval = interval;
            break;    
        }    
    }

    if (daysSinceLastRevision >= current_interval) {
        return true;
    }

    return false;
}

module.exports = {
  isReviseViolated,
  needRevise
};