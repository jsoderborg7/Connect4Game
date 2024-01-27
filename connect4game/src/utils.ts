interface BoardSettingsInterface {
    rows: number;
    columns: number;
    dropAnimationRate: number;
    flashAnimationRate: number;
    colors: {
      empty: string;
      p1: string;
      p2: string;
    };
  }
  
  interface WinTypesInterface {
    vertical: number;
    horizontal: number;
    rightDiagonal: number;
    leftDiagonal: number;
  }
  
  export const BoardSettings: BoardSettingsInterface = {
    rows: 6,
    columns: 7,
    dropAnimationRate: 50,
    flashAnimationRate: 600,
    colors: {
      empty: "#ffffff",
      p1: "#3fe81a",
      p2: "#f23ad0",
    },
  };
  
  export const WinTypes: WinTypesInterface = {
    vertical: 0,
    horizontal: 1,
    rightDiagonal: 2,
    leftDiagonal: 3,
  };