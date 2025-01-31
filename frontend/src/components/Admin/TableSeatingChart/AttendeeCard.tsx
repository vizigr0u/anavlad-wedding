import './style/AttendeeCard.css';

import { useDrag, useDrop } from 'react-dnd';
import { AdminAttendeeData } from './types';
import { useRef } from 'react';

const AttendeeCard = ({ attendee, onDrop, isPinned = false }: { attendee: AdminAttendeeData, isPinned?: boolean, onDrop?: (droppedId: number) => void }) => {
    const [{ isDragging }, dragConnector] = useDrag(() => ({
        type: 'attendee',
        item: attendee,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));
    const dragRef = useRef<HTMLDivElement>(null)
    dragConnector(dragRef);

    const [drop, dropConnector] = useDrop(() => ({
        accept: 'attendee',
        drop: (dropped: AdminAttendeeData) => onDrop && onDrop(dropped.attendee_id),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const dropRef = useRef<HTMLDivElement>(null)
    dropConnector(dropRef);
    const classNames = 'attendee-card' + (isDragging ? ' attendee-card--dragging' : '') + (isPinned ? ' attendee-card--pinned' : '');

    return (
        <div className={classNames} ref={dragRef}>
            <div ref={dropRef}>
                {attendee.name}({attendee.attendee_id})
            </div>
        </div>
    );
};

export default AttendeeCard;
