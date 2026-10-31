const LATITUDE = 23.3330;
const LONGITUDE = 86.3660;

function calculateMoonPhase(date) {
    const referenceDate = new Date('2000-01-06T18:14:00Z');
    const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000;
    const diff = date - referenceDate;
    const phase = (diff % lunarCycle) / lunarCycle;
    const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    return {
        illumination: (illumination * 100).toFixed(1),
        rawPhase: phase
    };
}

function getMoonTimes(rawPhase, sunriseSec, sunsetSec) {
    const sunriseHour = sunriseSec ? new Date(sunriseSec * 1000).getHours() + new Date(sunriseSec * 1000).getMinutes() / 60 : 5.25;
    const moonriseHour = (sunriseHour + rawPhase * 24) % 24;
    const moonsetHour = (moonriseHour + 13.0) % 24;
    return {
        riseHour: moonriseHour,
        setHour: moonsetHour,
        riseStr: formatHourAMPM(moonriseHour),
        setStr: formatHourAMPM(moonsetHour)
    };
}

function formatHourAMPM(hourFraction) {
    const totalMinutes = Math.round(hourFraction * 60);
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
}

const now = new Date();
const moon = calculateMoonPhase(now);
const sunriseSec = Math.floor(new Date().setHours(5, 15) / 1000);
const sunsetSec = Math.floor(new Date().setHours(18, 30) / 1000);
const moonTimes = getMoonTimes(moon.rawPhase, sunriseSec, sunsetSec);

console.log("Current Time:", now.toString());
console.log("Moon Phase:", moon);
console.log("Moon Times:", moonTimes);

// Test coordinate solver
const moonrise = new Date(now);
const riseHours = Math.floor(moonTimes.riseHour);
const riseMins = Math.round((moonTimes.riseHour - riseHours) * 60);
moonrise.setHours(riseHours, riseMins, 0, 0);

const moonset = new Date(now);
const setHours = Math.floor(moonTimes.setHour);
const setMins = Math.round((moonTimes.setHour - setHours) * 60);
moonset.setHours(setHours, setMins, 0, 0);

console.log("Moonrise Date Object:", moonrise.toString());
console.log("Moonset Date Object:", moonset.toString());

let isMoonUp = false;
let moonProgress = 0;

if (moonset > moonrise) {
    if (now >= moonrise && now <= moonset) {
        isMoonUp = true;
        moonProgress = (now - moonrise) / (moonset - moonrise);
    } else {
        isMoonUp = false;
        if (now < moonrise) {
            const prevSet = new Date(moonset.getTime() - 24 * 60 * 60 * 1000);
            moonProgress = (now - prevSet) / (moonrise - prevSet);
        } else {
            const nextRise = new Date(moonrise.getTime() + 24 * 60 * 60 * 1000);
            moonProgress = (now - moonset) / (nextRise - moonset);
        }
    }
} else {
    if (now >= moonrise || now <= moonset) {
        isMoonUp = true;
        const actualRise = now <= moonset ? new Date(moonrise.getTime() - 24 * 60 * 60 * 1000) : moonrise;
        const actualSet = now <= moonset ? moonset : new Date(moonset.getTime() + 24 * 60 * 60 * 1000);
        moonProgress = (now - actualRise) / (actualSet - actualRise);
    } else {
        isMoonUp = false;
        const nextRise = moonrise;
        const prevSet = moonset;
        moonProgress = (now - prevSet) / (nextRise - prevSet);
    }
}

console.log("Is Moon Up:", isMoonUp);
console.log("Moon Progress:", moonProgress);

let moonT = 0;
if (isMoonUp) {
    moonT = 0.323 + moonProgress * (0.677 - 0.323);
} else {
    if (moonProgress < 0.5) {
        moonT = 0.677 + moonProgress * 2 * (1.0 - 0.677);
    } else {
        moonT = 0.0 + (moonProgress - 0.5) * 2 * 0.323;
    }
}

const moonX = 5 + moonT * 90;
const moonY = 100 * (1 - moonT) * (1 - moonT) + 22.222 * moonT * (1 - moonT) + 100 * moonT * moonT;

console.log("Resulting Coordinates - Left:", moonX.toFixed(2) + "%", "Top:", moonY.toFixed(2) + "%");
