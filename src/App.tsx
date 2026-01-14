import React, { useState } from 'react';
import './App.scss';
import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { TodoList } from './components/TodoList';

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type Todo = {
  id: number;
  title: string;
  userId: number;
  completed: boolean;
  user: User;
};

export const App = () => {
  const [errorTitle, setErrorTitle] = useState(false);
  const [errorUser, setErrorUser] = useState(false);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(0);
  const preparedTodos: Todo[] = todosFromServer.map(todo => {
    const foundUser = usersFromServer.find(u => u.id === todo.userId);

    if (!foundUser) {
      throw new Error('User not found');
    }

    return {
      ...todo,
      user: foundUser,
    };
  });

  const [todos, setTodos] = useState<Todo[]>(preparedTodos);
  const hendleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const cleanedValue = value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9 ]/g, '');

    setTitle(cleanedValue);
    setErrorTitle(false);
  };

  const hendleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUser(+e.target.value);
    setErrorUser(false);
  };

  const hendleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    setErrorTitle(!title.trim());
    setErrorUser(!user);

    if (!title || !user) {
      return;
    }

    const selectedUser = usersFromServer.find(u => u.id === user);

    if (!selectedUser) {
      return;
    }

    const newTodo = {
      id: Math.max(...todos.map(t => t.id)) + 1,
      title: trimmedTitle,
      userId: user,
      completed: false,
      user: selectedUser,
    };

    setTodos(prev => [...prev, newTodo]);

    setTitle('');
    setUser(0);
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form action="/api/todos" method="POST" onSubmit={hendleSubmit}>
        <label className="lable" htmlFor="post-title">
          Title:
        </label>
        <div className="field">
          <input
            id="post-title"
            type="text"
            placeholder="Enter a title"
            data-cy="titleInput"
            value={title}
            onChange={hendleTitleChange}
          />

          {errorTitle && <span className="error">Please enter a title</span>}
        </div>

        <label className="lable" htmlFor="post-user">
          User:
        </label>
        <div className="field">
          <select
            data-cy="userSelect"
            id="post-user"
            value={user}
            onChange={hendleUserChange}
          >
            <option value={0} disabled>
              Choose a user
            </option>
            {usersFromServer.map(us => (
              <option value={us.id} key={us.id}>
                {us.name}
              </option>
            ))}
          </select>

          {errorUser && <span className="error">Please choose a user</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
