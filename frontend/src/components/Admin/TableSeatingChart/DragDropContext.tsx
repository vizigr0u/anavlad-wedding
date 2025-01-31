import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

interface DragDropContextProps {
    children: React.ReactNode;
}

export default function DragDropContext({ children }: DragDropContextProps) {
    return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
