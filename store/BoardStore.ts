import { ID, databases } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { todo } from "node:test";
import { create } from "zustand";

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;
  newTaskInput: string;
  newTaskType: TypedColumn;

  searchString: string;
  setSearchString: (searchString: string) => void;

  addTask: (todo: string, columnId: TypedColumn) => void;
  deleteTask: (taskIndex: number, todoId: Todo, id: TypedColumn) => void;

  setNewTaskInput: (input: string) => void;
  setNewTaskType: (columnId: TypedColumn) => void;
}

export const useBoardStore = create<BoardState>((set) =>({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },

  searchString: "",
  newTaskInput: "",
  newTaskType: "todo",

  setSearchString: (searchString) => set({searchString}),

  getBoard: async() => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },
  // Set the variable in a global state
  setBoardState: (board) => set({ board }),

  deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,   

    )
  },


  setNewTaskInput: (input: string) => set({newTaskInput: input}),
  setNewTaskType: (columnId: TypedColumn) => set({ newTaskType: columnId}),
  
  updateTodoInDB: async(todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
      
    )
  },
  
  addTask: async(todo: string, columnId: TypedColumn) => {
    
    const {$id} = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),

      {
        title: todo,
        status: columnId,
      }
    );

      set({ newTaskInput:""});

      set((state) => {
        const newColumns = new Map(state.board.columns);

        const newTodo: Todo = {
          $id,
          $createdAt: new Date().toISOString(),
          title: todo,
          status: columnId,
        };
      
        const column = newColumns.get(columnId);
      
        if (!column) {
          newColumns.set(columnId, {
            id:columnId,
            todos: [newTodo],
          });
        } else {
          newColumns.get(columnId)?.todos.push(newTodo);
        }

        return {
          board: {
            columns: newColumns,
          }

        }
    })
  }
}));

