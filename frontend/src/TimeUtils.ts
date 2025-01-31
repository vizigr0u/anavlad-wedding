const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: "auto" });
const timeDivs: [number, Intl.RelativeTimeFormatUnit][] = [[60, "second"], [60, "minute"], [24, "hour"], [30, "day"], [12, "month"]];

export function GetRelativeTimeString(date: Date) {
    const dateDiff = (date.getTime() - new Date().getTime()) / 1000;
    const [diff, divName] = reduceSecondsToHumanTimeDiv(dateDiff);
    return relativeTimeFormat.format(Math.round(diff), divName);
}

function reduceSecondsToHumanTimeDiv(diffInSec: number): [number, Intl.RelativeTimeFormatUnit] {
    let diff = Math.abs(diffInSec);
    const sign = diffInSec >= 0 ? 1 : -1;
    for (let i = 0; i < timeDivs.length; i++) {
        const [nextDiv, divName] = timeDivs[i];
        if (diff < nextDiv)
            return [sign * diff, divName];
        diff /= nextDiv;
    }
    return [sign * diff, "year"];
}
