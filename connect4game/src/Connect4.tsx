import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import { BoardSettings, WinTypes } from "./utils";

const ConnectFour = () => {
  const createBoard = () => {
    return new Array(BoardSettings.rows * BoardSettings.columns).fill(
      BoardSettings.colors.empty
    );
  };

  const getFirstPlayerTurn = () => {
    return BoardSettings.colors.p1;
  };

  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(getFirstPlayerTurn());
  const [win, setWin] = useState<{
    winner: any;
    winningCells: { row: number; column: number }[];
  } | null>(null);
  const [flashTimer, setFlashTimer] = useState(null);
  const [dropping, setDropping] = useState(false);
  const domBoard = useRef(null);

  const getIndex = (row: number, column: number) => {
    const index = row * BoardSettings.columns + column;
    if (index > BoardSettings.rows * BoardSettings.columns) return null;
    return index;
  };

  const getRowAndColumn = (index: number) => {
    if (index > BoardSettings.rows * BoardSettings.columns) return null;
    const row = Math.floor(index / BoardSettings.columns);
    const column = Math.floor(index % BoardSettings.columns);
    return {
      row,
      column,
    };
  };

  const restartGame = () => {
    setCurrentPlayer(getFirstPlayerTurn());
    setWin(null);
    setBoard(createBoard());
  };

  const getDomBoardCell = (index: number) => {
    if (!domBoard.current) return null;
    const board = domBoard.current as HTMLElement;
    const blocks = board.querySelectorAll(".board-block");
    return blocks[index];
  };

  const findFirstEmptyRow = (column: number) => {
    const { empty } = BoardSettings.colors;
    const { rows } = BoardSettings;
    for (let i = 0; i < rows; i++) {
      const index = getIndex(i, column);
      if (index !== null && board[index] !== empty) {
        return i - 1;
      }
    }
    return rows - 1;
  };

  async function handleDrop(column: number) {
    if (dropping || win) return;
    const row = findFirstEmptyRow(column);
    if (row < 0) return;
    setDropping(true);
    await animateDrop(row, column, currentPlayer);
    setDropping(false);
    const newBoard = board.slice();
    const index = getIndex(row, column);
    if (index !== null) {
      newBoard[index] = currentPlayer;
      setBoard(newBoard);
    }

    setCurrentPlayer(
      currentPlayer === BoardSettings.colors.p1
        ? BoardSettings.colors.p2
        : BoardSettings.colors.p1
    );
  }

  async function animateDrop(
    row: number,
    column: number,
    color: string,
    currentRow?: number
  ) {
    if (currentRow === undefined) {
      currentRow = 0;
    }

    return new Promise<void>((resolve) => {
      if (currentRow !== undefined && currentRow > row!) {
        return resolve();
      }

      if (currentRow !== undefined && currentRow > 0) {
        const previousRowIndex = getIndex(currentRow - 1, column);

        if (previousRowIndex !== null) {
          const previousCell = getDomBoardCell(previousRowIndex);
          if (previousCell) {
            (previousCell as HTMLElement).style.backgroundColor =
              BoardSettings.colors.empty;
          }
        }
      }

      const currentRowIndex = getIndex(currentRow!, column);

      if (currentRowIndex !== null) {
        const currentCell = getDomBoardCell(currentRowIndex);

        if (currentCell) {
          (currentCell as HTMLElement).style.backgroundColor = color;
        }
      }

      setTimeout(
        () =>
          resolve(
            animateDrop(
              row,
              column,
              color,
              currentRow === undefined ? undefined : ++currentRow
            )
          ),
        BoardSettings.dropAnimationRate
      );
    });
  }

  useEffect(() => {
    if (!win) {
      if (flashTimer) clearTimeout(flashTimer);
    }
  }, [win, flashTimer]);

  const createWinState = (
    start: number,
    winType: number
  ): { winner: string; winningCells: { row: number; column: number }[] } => {
    const win = {
      winner: board[start],
      winningCells: [] as { row: number; column: number }[],
    };

    let pos = getRowAndColumn(start);

    while (pos !== null) {
      const currentRowIndex = getIndex(pos.row, pos.column);

      if (currentRowIndex !== null) {
        const current = board[currentRowIndex];

        if (current === win.winner) {
          win.winningCells.push({ row: pos.row, column: pos.column });

          if (winType === WinTypes.horizontal) pos.column++;
          else if (winType === WinTypes.vertical) pos.row++;
          else if (
            winType === WinTypes.leftDiagonal ||
            winType === WinTypes.rightDiagonal
          ) {
            pos.row++;
            winType === WinTypes.leftDiagonal ? pos.column++ : pos.column--;
          }
        } else return win;
      } else return win;
    }

    return win;
  };

  const checkWin = (
    type: number
  ): {
    winner: string;
    winningCells: { row: number; column: number }[];
  } | null => {
    const { rows, columns, colors } = BoardSettings;
    const empty = colors.empty;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= columns - 4; col++) {
        const start = getIndex(row, col);

        if (start !== null && board[start] !== empty) {
          let counter = 1;

          for (let k = col + 1; k < col + 4; k++) {
            const currentIndex = getIndex(row, k);

            if (
              currentIndex !== null &&
              start !== null &&
              board[currentIndex] === board[start]
            ) {
              counter++;

              if (counter === 4) return createWinState(start, type);
            }
          }
        }
      }
    }

    return null;
  };

  useEffect(() => {
    if (dropping || win) return;

    const isWin = () =>
      checkWin(WinTypes.rightDiagonal) ||
      checkWin(WinTypes.leftDiagonal) ||
      checkWin(WinTypes.horizontal) ||
      checkWin(WinTypes.vertical);

    setWin(isWin());
  }, [board, dropping, win]);

  function createDropButtons(): JSX.Element[] {
    const btns: JSX.Element[] = [];
    for (let i = 0; i < BoardSettings.columns; i++) {
      btns.push(
        <button
          key={i}
          className="cell drop-button"
          onClick={() => handleDrop(i)}
          style={{
            backgroundColor: currentPlayer,
          }}
        />
      );
    }
    return btns;
  }

  const cells: JSX.Element[] = board.map((c, i) => (
    <button
      key={"c" + i}
      className="cell board-block"
      style={{
        backgroundColor: c,
        borderRadius: "50px",
      }}
    />
  ));

  function getGridTemplateColumns(): string {
    let gridTemplateColumns = "";
    for (let i = 0; i < BoardSettings.columns; i++) {
      gridTemplateColumns += "auto ";
    }
    return gridTemplateColumns;
  }

  return (
    <>
      <div
        className={`board ${
          currentPlayer === BoardSettings.colors.p1 ? "p1-turn" : "p2-turn"
        } `}
        ref={domBoard}
        style={{
          gridTemplateColumns: getGridTemplateColumns(),
        }}
      >
        {createDropButtons()}
        {cells}
      </div>
      {!win && (
        <h2 style={{ color: currentPlayer }}>
          {currentPlayer === BoardSettings.colors.p1
            ? "Player 1's Turn"
            : "Player 2's Turn"}
        </h2>
      )}
      {win && (
        <>
          <h1 style={{ color: win.winner }}>
            {" "}
            {win.winner === BoardSettings.colors.p1
              ? "Player 1"
              : "Player 2"}{" "}
            WON!
          </h1>
          <button onClick={restartGame}>Play Again</button>
          <br />
          <br />
        </>
      )}
    </>
  );
};
export default ConnectFour;
