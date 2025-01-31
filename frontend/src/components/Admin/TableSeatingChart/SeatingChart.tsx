import { useState } from 'react';
import { Affinities, AdminAttendeeData } from './types';
import DragDropContext from './DragDropContext';
import Table from './Table';
import AttendeeCard from './AttendeeCard';
import UnplacedArea from './UnplacedArea';
import EmptySeat from './EmptySeat';

function Solve(attendeeIds: number[], affinities: Affinities, tables: number[][]): number[][] {
    const langMult = 1.5;
    const strMult = 1.0;

    const temperatureSchedule = (t: number): number => {
        return 0.999 * t;
    };

    const randomSwap = (seats: number[][]): void => {
        const seatAIndex = Math.floor(Math.random() * seats.length);
        const seatBIndex = Math.floor(Math.random() * seats.length);

        if (seatAIndex !== seatBIndex) {
            const temp = seats[seatAIndex];
            seats[seatAIndex] = seats[seatBIndex];
            seats[seatBIndex] = temp;
        }
    };

    const scoreTable = (table: number[], affinities: Affinities): number => {
        let tableScore = 0;

        table.forEach((attendeeId, i) => {
            table.slice(i + 1).forEach((otherAttendeeId) => {
                const attendeeAffinities = affinities[attendeeId]?.affinities || {};
                const otherAttendeeAffinities = affinities[otherAttendeeId]?.affinities || {};

                const affScore = (attendeeAffinities[otherAttendeeId] || 0) + (otherAttendeeAffinities[attendeeId] || 0);
                tableScore += affScore * affScore;

                if (affinities[attendeeId]?.lang === affinities[otherAttendeeId]?.lang) {
                    tableScore += langMult;
                }
            });
        });

        return tableScore;
    };

    const scoreSeatingChart = (tables: number[][], affinities: Affinities): number => {
        return tables.reduce((totalScore, table) => totalScore + scoreTable(table, affinities), 0);
    };

    function fillSeats(tables: number[][], seats: number[][], attendeeIds: number[]) {
        for (let i = 0; i < seats.length; i++) {
            const seat = seats[i];
            tables[seat[0]][seat[1]] = i < attendeeIds.length ? attendeeIds[i] : -1;
        }
    }

    const createSeatingChart = (attendeeIds: number[], affinities: Affinities, tables: number[][]): number[][] => {
        const initialTemperature = 1000;
        const finalTemperature = 1e-6;
        const maxIterations = 1e5;

        const availableSeats: number[][] = [];
        for (let i = 0; i < tables.length; i++) {
            for (let j = 0; j < tables[i].length; j++) {
                const attId = tables[i][j];
                if (attId === -1)
                    availableSeats.push([i, j]);
            }
        }
        console.log(`placing ${attendeeIds.length} attendees in ${availableSeats.length} available seats.`);
        if (attendeeIds.length > availableSeats.length) {
            console.log('Not enough seats available');
            return tables;
        }
        let temperature = initialTemperature;
        let currentSeats = availableSeats.map(s => [...s]);
        let currentScore = scoreSeatingChart(tables, affinities);
        let bestTables = tables.map((table) => [...table]);
        let bestScore = currentScore;

        for (let i = 0; i < maxIterations && temperature > finalTemperature; i++) {
            const newSeats = currentSeats.map((s) => [...s]);
            randomSwap(newSeats);
            fillSeats(tables, newSeats, attendeeIds);

            const newScore = scoreSeatingChart(tables, affinities);
            const deltaScore = newScore - currentScore;
            const probability = Math.exp(deltaScore / temperature);

            if (deltaScore > 0 || Math.random() < probability) {
                currentSeats = newSeats;
                currentScore = newScore;
            }

            if (currentScore > bestScore) {
                bestTables = tables.map((table) => [...table]);
                bestScore = currentScore;
            }

            temperature = temperatureSchedule(temperature);
        }

        return bestTables;
    };

    return createSeatingChart(attendeeIds, affinities, tables);

};

export type SeatMap = {
    [key: number]: {
        tableIndex: number;
        seatIndex: number;
    };
};

export default function SeatingChart({ attendees, affinities }: { attendees: AdminAttendeeData[], affinities: Affinities }) {
    const [seatMaps, setSeatMaps] = useState<SeatMap[]>([{}, {}]); // [manual seats, auto seats]
    // const [autoSeatsById, setAutoSeatsById] = useState<SeatMap>({});
    const firstTableSize = 10;
    const otherTablesSize = 8;

    const attendeesById: {
        [key: number]: {
            attendee: AdminAttendeeData
        };
    } = {};
    attendees.forEach(att => {
        attendeesById[att.attendee_id] = { attendee: att };
    });

    function seatMapWithoutIds(seats: SeatMap, ...attendeeIds: number[]) {
        const newMap = { ...seats };
        attendeeIds.forEach(id => {
            delete newMap[id];
        });
        return newMap;
    }

    function unseatAttendee(attendee: AdminAttendeeData) {
        console.log(`unseating attendee ${JSON.stringify(attendee)}`);
        setSeatMaps(prevSeatMaps => prevSeatMaps.map(s => seatMapWithoutIds(s, attendee.attendee_id)));
    };

    function seatAttendee(attendeeID: number, tableIndex: number, seatIndex: number) {
        console.log(`seating attendee ${JSON.stringify(attendeeID)} at ${tableIndex}[${seatIndex}]`);

        setSeatMaps(prevSeatMaps => {
            const newMaps = prevSeatMaps.map(s => seatMapWithoutIds(s, attendeeID));
            newMaps[0][attendeeID] = { tableIndex: tableIndex, seatIndex: seatIndex };
            return newMaps;
        });
    };

    function swapAttendees(idA: number, idB: number) {
        console.log(`swapping attendees ${idA} and ${idB}`);
        setSeatMaps(prevSeatMaps => {
            function getSeat(id: number) {
                console.log(`seats: ${JSON.stringify(prevSeatMaps[0][id])} - ${JSON.stringify(prevSeatMaps[1][id])}`);
                console.log(`seat chosen: ${JSON.stringify(prevSeatMaps[0][id] ?? prevSeatMaps[1][id])}`);
                return (prevSeatMaps[0][id] ?? prevSeatMaps[1][id]);
            }
            const seatA = { ...getSeat(idA) };
            const seatB = { ...getSeat(idB) };

            const newMaps = prevSeatMaps.map(s => seatMapWithoutIds(s, idA, idB));
            newMaps[0][idA] = { tableIndex: seatB.tableIndex, seatIndex: seatB.seatIndex };
            newMaps[0][idB] = { tableIndex: seatA.tableIndex, seatIndex: seatA.seatIndex };
            return newMaps;
        });
    };

    const tableSizes = [firstTableSize];
    for (let numSeats = firstTableSize; numSeats < attendees.length; numSeats += otherTablesSize) {
        tableSizes.push(otherTablesSize);
    }
    const tables: number[][] = tableSizes.map(size => Array.from({ length: size }, () => -1));
    for (const [key, indices] of Object.entries(seatMaps[0])) {
        const id = Number(key) as keyof SeatMap;
        tables[indices.tableIndex][indices.seatIndex] = id;
    }
    const initialTables = tables.map(t => [...t]);
    for (const [key, indices] of Object.entries(seatMaps[1])) {
        const id = Number(key) as keyof SeatMap;
        if (tables[indices.tableIndex][indices.seatIndex] !== -1) {
            console.log(`Warning: overriding tables[${indices.tableIndex}][${indices.seatIndex}] (${tables[indices.tableIndex][indices.seatIndex]} with ${id})`);
        }
        tables[indices.tableIndex][indices.seatIndex] = id;
    }

    const computeTables = () => {
        const attendeesToPlace = attendees.map(att => att.attendee_id).filter(id => !seatMaps[0][id]);
        const result = Solve(attendeesToPlace, affinities, initialTables);
        const newMap: SeatMap = {};
        for (let tableIndex = 0; tableIndex < result.length; tableIndex++) {
            for (let seatIndex = 0; seatIndex < result[tableIndex].length; seatIndex++) {
                const attendeeId = result[tableIndex][seatIndex];
                if (!!seatMaps[0][attendeeId])
                    continue;
                newMap[attendeeId] = { tableIndex: tableIndex, seatIndex: seatIndex };
            }
        }
        setSeatMaps(prevSeatMaps => [prevSeatMaps[0], newMap]);
    };

    function clearTables() {
        setSeatMaps(prevSeatMaps => [prevSeatMaps[0], {}]);
    }

    return (
        <DragDropContext>
            <UnplacedArea attendees={attendees.filter(att => !seatMaps.some(s => !!s[att.attendee_id]))}
                onDrop={(attendee) => unseatAttendee(attendee)} />
            <div className='tables' style={{ display: 'flex', flexWrap: 'wrap' }}>
                {tables.map((seats, tableIndex) => (
                    <Table key={tableIndex} name={`Table ${tableIndex + 1} (${seats.filter(s => s !== -1).length}/${seats.length})`}>
                        {seats.map((attendeeId, seatIndex) => attendeeId === -1 ?
                            <EmptySeat key={seatIndex} onDrop={droppedId => seatAttendee(droppedId, tableIndex, seatIndex)} /> :
                            <AttendeeCard key={1000 + attendeeId} onDrop={droppedId => swapAttendees(droppedId, attendeeId)} attendee={attendeesById[attendeeId].attendee} isPinned={!!seatMaps[0][attendeeId]} />)}
                    </Table>
                ))}
            </div>
            <button onClick={() => computeTables()}>Compute</button>
            <button onClick={() => clearTables()}>Clear</button>
            {/* {result && <pre>{result.map(t => t.map(id => id > -1 ? attendeesById[id].attendee.name : 'empty').join(', ')).join('\n')}</pre>} */}
        </DragDropContext>
    );
}
