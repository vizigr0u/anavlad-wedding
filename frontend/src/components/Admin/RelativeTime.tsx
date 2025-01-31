// import './style/Collapsable.css'

import { GetRelativeTimeString } from "../../TimeUtils";
import useRefreshInterval from "../../hooks/UseRefreshInterval";


export default function RelativeTime({ time, styleName }: { time: Date, styleName: string }) {
  const text = time ? GetRelativeTimeString(new Date(time)) : 'unknown'
  const classes = "live-relative-time " + (styleName ? " " + styleName : "");
  return (
    <span className={classes}>{text}</span>
  );
}

export function LiveRelativeTime({ time, styleName, updateFreq = 1000 }: { time: Date, styleName: string, updateFreq?: number }) {
  useRefreshInterval(updateFreq);
  return <RelativeTime styleName={styleName} time={time} />;
}
