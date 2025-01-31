import './style/UnplacedArea.css'

import { useDrop } from 'react-dnd';
import AttendeeCard from './AttendeeCard';
import { AdminAttendeeData } from './types';
import { useRef } from 'react';

export default function UnplacedArea({ attendees, onDrop }: { attendees: AdminAttendeeData[]; onDrop: (attendee: any) => void }) {
    const [{ isOver }, dropConnector] = useDrop(() => ({
        accept: 'attendee',
        drop: (item) => onDrop(item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const dropRef = useRef<HTMLDivElement>(null)
    dropConnector(dropRef);

    return (
        <div className={'unplaced-area' + (isOver ? ' unplaced-area--dropping' : '')} ref={dropRef} >
            <strong>Unplaced ({attendees.length})</strong>
            {attendees.map((attendee) => (
                <AttendeeCard key={attendee.attendee_id} attendee={attendee} />
            ))}
        </div>
    );
};
