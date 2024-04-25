'use client'

import { useBoardStore } from '@/store/BoardStore';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Column from './Column';

function Board() {

  const [getBoard, board, setBoardState, updateTodoInDB] = useBoardStore((state) => [
    state.getBoard,
    state.board,
    state.setBoardState,
    state.updateTodoInDB
  ]);

  useEffect(() => {
    getBoard();
  }, [getBoard]);
 
  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    // If the user dragged card outside of board, do nothing
    if (!destination) return;

    // Handle the column drag
    if (type === "column") {
      const entries = Array.from(board.columns.entries());
      const [removed] = entries.splice(source.index,1);
      entries.splice(destination.index, 0, removed);
      const rearrangedColumns = new Map(entries);
      // Set the board state to the new state (only change the coloumn, not the values)
      setBoardState({
        ...board, 
        columns: rearrangedColumns,
      })
    }

    // Handle the card drag
    // React beautiful DND needs ids instead of indexed
    const columns = Array.from(board.columns);
    const startColIndex = columns[Number(source.droppableId)];
    const finishColIndex = columns[Number(destination.droppableId)];

    const starCol: Column = {
      id: startColIndex[0],
      todos: startColIndex[1].todos,
    };

    const finishCol: Column = {
      id: finishColIndex[0],
      todos: finishColIndex[1].todos,
    }

    // Do nothign if dragged to the original position
    if (!starCol || !finishCol) return;

    if (source.index === destination.index &&  starCol === finishCol) return;
    
    const newTodos = starCol.todos;
    const [todoMoved] = newTodos.splice(source.index, 1);

    if (starCol.id === finishCol.id) {
      // Same column task drag, different position
        newTodos.splice(destination.index, 0, todoMoved);
        const newCol = {
          id: starCol.id,
          todos: newTodos,
        };
        const newColumns = new Map(board.columns);
        newColumns.set(starCol.id, newCol);

        setBoardState({ ...board, columns: newColumns})
    
    } else {
      // Dragging to another column
      const finishTodos = Array.from(finishCol.todos)
      finishTodos.splice(destination.index, 0, todoMoved)

      const newColumns = new Map(board.columns);
      const newCol = {
        id: starCol.id,
        todos: newTodos,
      };

      newColumns.set(starCol.id, newCol);
      newColumns.set(finishCol.id, {
        id: finishCol.id,
        todos: finishTodos,
      });

      // Update in cloud database
      updateTodoInDB(todoMoved, finishCol.id);

      setBoardState({...board, columns: newColumns});
    }

    
  };

  console.log(board)
  return(  
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId='board' direction='horizontal' type="column">
        {(provided) => (
          <div 
            className='grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto'
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column 
              key={id}
              id={id}
              todos={column.todos}
              index={index}
              />
            ))}
          </div> 
          )}
      </Droppable>
    </DragDropContext>
  );
}

export default Board;


