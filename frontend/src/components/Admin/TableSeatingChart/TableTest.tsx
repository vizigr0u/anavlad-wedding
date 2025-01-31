import { useContext, useState } from 'react';
import Collapsable from '../Collapsable';
import { Affinities, AdminAttendeeData } from './types';
import SeatingChart from './SeatingChart';
import { ConfigContext } from '../../../AppConfigContext';

const savedJson = '{"3":{"lang":1,"affinities":{}},"4":{"lang":1,"affinities":{"3":4}},"5":{"lang":1,"affinities":{"3":3,"4":3}},"6":{"lang":0,"affinities":{}},"7":{"lang":0,"affinities":{"6":4}},"8":{"lang":2,"affinities":{"3":2,"4":2,"5":2}},"9":{"lang":1,"affinities":{"3":3,"4":3,"5":3,"8":4}},"10":{"lang":1,"affinities":{"8":1,"9":2}},"11":{"lang":1,"affinities":{"8":2,"9":2}},"12":{"lang":1,"affinities":{"8":1,"9":2,"11":4}},"13":{"lang":1,"affinities":{"8":1,"9":2,"11":2,"12":2}},"14":{"lang":1,"affinities":{"8":1,"9":2,"11":2,"12":2,"13":4}},"15":{"lang":1,"affinities":{"8":1,"9":2,"10":1,"11":2,"12":2,"13":2,"14":2}},"16":{"lang":2,"affinities":{"8":4,"9":2}},"17":{"lang":2,"affinities":{"8":3,"9":1,"16":3}},"18":{"lang":2,"affinities":{"8":3,"16":1}},"19":{"lang":1,"affinities":{"8":2,"9":2,"11":2,"18":4}},"20":{"lang":0,"affinities":{"8":2,"9":2,"18":2,"19":2}},"21":{"lang":0,"affinities":{"8":2,"9":3,"18":2,"19":3,"20":4}},"22":{"lang":1,"affinities":{"3":3,"4":3,"5":3,"8":2,"9":3}},"24":{"lang":1,"affinities":{"3":3,"4":2,"5":3,"8":2,"9":3,"22":3}},"25":{"lang":1,"affinities":{"3":2,"4":2,"5":2,"8":2,"9":2,"22":2,"24":4}},"32":{"lang":0,"affinities":{"6":3,"8":2,"9":2,"10":3}},"33":{"lang":0,"affinities":{"6":2,"8":2,"9":2,"10":2,"32":4}},"36":{"lang":1,"affinities":{"3":1,"4":1,"5":1,"8":1,"9":2,"10":1,"11":2,"12":2,"13":2,"14":2,"15":2,"22":1}},"44":{"lang":1,"affinities":{"9":2,"10":1,"32":1}},"45":{"lang":0,"affinities":{"3":2,"4":2,"6":0,"9":3}},"46":{"lang":0,"affinities":{"6":1,"9":3,"45":4}},"47":{"lang":1,"affinities":{"8":1,"9":2,"11":2,"12":2,"13":2,"14":2,"15":2,"36":2}},"48":{"lang":1,"affinities":{"8":2,"9":2,"11":2,"12":2,"13":2,"14":2,"15":2,"36":2,"47":4}},"49":{"lang":1,"affinities":{"8":1,"9":2,"11":2,"12":2,"13":2,"14":2,"15":2,"36":2,"47":2,"48":2}},"50":{"lang":1,"affinities":{"8":2,"9":2,"11":2,"12":2,"13":2,"14":2,"15":2,"36":2,"47":2,"48":2,"49":4}},"51":{"lang":0,"affinities":{"8":2,"9":2,"11":2,"12":2,"13":2,"14":2,"15":2,"36":2,"47":2,"48":2,"49":2,"50":2}},"52":{"lang":1,"affinities":{"6":3,"7":1,"8":0,"9":2,"10":1,"32":2,"44":1,"46":1}},"53":{"lang":1,"affinities":{"6":2,"9":2,"32":2,"44":1,"46":1,"52":2}},"54":{"lang":0,"affinities":{"9":3,"36":1,"52":3}},"55":{"lang":0,"affinities":{"54":4}},"60":{"lang":0,"affinities":{"6":1,"9":2,"10":2,"32":2,"33":1,"44":1,"52":1,"53":1}},"68":{"lang":2,"affinities":{"8":2,"9":1,"18":2,"19":2,"20":2,"21":2}},"69":{"lang":2,"affinities":{"8":2,"9":2,"18":2,"19":2,"20":2,"21":2,"68":4}},"70":{"lang":2,"affinities":{"8":2,"9":2,"18":2,"19":2,"68":2,"69":2}},"71":{"lang":2,"affinities":{"8":2,"9":2,"10":4,"18":2,"19":2,"21":2,"22":2,"68":2,"69":2,"70":2}},"72":{"lang":2,"affinities":{"8":2,"9":1,"18":2,"19":2,"20":2,"21":2,"22":0,"68":2,"69":2,"70":2,"71":2}},"93":{"lang":0,"affinities":{"6":4,"7":4}},"94":{"lang":0,"affinities":{"8":3,"9":2,"18":2,"19":2,"71":2,"72":2}},"95":{"lang":0,"affinities":{"8":2,"9":2,"18":2,"19":2,"71":2,"72":2,"94":4}}}';

export default function TableTest({ data }: { data: AdminAttendeeData[] }) {
    const config = useContext(ConfigContext);
    const langs = Object.keys(config.languages);
    const strengths = ['😐', '🙂', '😄', '😍', '❤'];

    const attendees = data.filter((att: AdminAttendeeData) => att.rsvp_answer === 1);

    function initAffinities(): Affinities {
        const savedAff = JSON.parse(savedJson);
        attendees.filter(att => !savedAff[att.attendee_id]).forEach(att => {
            savedAff[att.attendee_id] = { lang: 0, affinities: {} };
        });
        return savedAff;
        // if (aff !== {})
        //     return aff;
        // attendees.forEach(att => {
        //     aff[att.attendee_id] = { lang: 0, affinities: {} };
        // });
        // return aff;
    }

    const [affinities, setAffinities] = useState<Affinities>(initAffinities());

    function getAffinity(att1: AdminAttendeeData, att2: AdminAttendeeData): number {
        return getAffinityById(att1.attendee_id, att2.attendee_id);
    }

    function getAffinityById(id1: number, id2: number): number {
        if (id1 === id2)
            return strengths.length - 1;
        return (id1 > id2 ? affinities[id1]?.affinities[id2] : affinities[id2]?.affinities[id1]) ?? 0;
    }

    function setLang(att: AdminAttendeeData) {
        const id = att.attendee_id;
        const aff = JSON.parse(JSON.stringify(affinities));
        aff[id].lang = (aff[id].lang + 1) % (langs.length);
        setAffinities(aff);
    }

    function setStrength(att1: AdminAttendeeData, att2: AdminAttendeeData) {
        const id1 = att1.attendee_id;
        const id2 = att2.attendee_id;
        const aff = JSON.parse(JSON.stringify(affinities));
        aff[Math.max(id1, id2)].affinities[Math.min(id1, id2)] = (getAffinity(att1, att2) + 1) % (strengths.length);
        setAffinities(aff);
    }

    return <>
        <Collapsable title='Affinities'>
            {attendees.map(att => <div key={att.attendee_id} className='tables_attendee_config'>
                <span>{att.name}({att.attendee_id} user {att.user_id})</span>
                <span>
                    <button className='tables_attendee__setlang' onClick={() => setLang(att)} >
                        {langs[affinities[att.attendee_id].lang]}
                    </button>
                </span>
                <div className='tables_attendee_affinities'>
                    {attendees.filter(at2 => at2.attendee_id < att.attendee_id)
                        .map(att2 => <div key={att.name + '_' + att2.name} className='tables_attendee_affinity' >
                            {att2.name}
                            <button className='tables_attendee__set-strength'
                                onClick={() => setStrength(att, att2)}
                            // disabled={att.user_id === att2.user_id}
                            >
                                {strengths[getAffinity(att, att2)]}
                            </button>
                        </div>)}
                </div>
            </div>)}
            <Collapsable title='JSON'><pre>{JSON.stringify(affinities)}</pre></Collapsable>
        </Collapsable>
        <Collapsable title='Seating Charts'>
            <SeatingChart attendees={attendees} affinities={affinities} />
        </Collapsable>
    </>
}
