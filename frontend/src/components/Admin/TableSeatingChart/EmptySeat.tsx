import './style/EmptySeat.css'

import { useDrop } from 'react-dnd';
import { AdminAttendeeData } from './types';
import { useRef } from 'react';

export default function EmptySeat({ onDrop }: { onDrop: (attendeeId: number) => void }) {
    const [{ isOver }, dropConnector] = useDrop(() => ({
        accept: 'attendee',
        drop: (dropped: AdminAttendeeData) => onDrop(dropped.attendee_id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const dropRef = useRef<HTMLDivElement>(null)
    dropConnector(dropRef);

    return (
        <div className={'empty-seat' + (isOver ? ' empty-seat--dropping' : '')} ref={dropRef} ></div>
    );
};
