export const seatKey = (row, col) => `${row}-${col}`;

export const getSeatStatus = (status) => {
  if (!status) {
    return "available";
  }

  const normalized = String(status).toLowerCase();
  const allowed = [
    "available",
    "reserved",
    "booked",
    "blocked",
    "staff",
    "aisle",
  ];
  return allowed.includes(normalized) ? normalized : "available";
};

export const isAisleCell = (cell) => {
  if (!cell) {
    return false;
  }

  const cellType = String(cell.cellType ?? cell.type ?? "").toLowerCase();
  const status = String(cell.status ?? "").toLowerCase();

  return cellType === "couloir" || cellType === "aisle" || status === "aisle";
};

export const normalizeSeatsPayload = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.seats)) {
    return payload.seats;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
};

export const buildSeatRows = (seatMap = []) => {
  const rowsMap = new Map();
  let maxCols = 0;

  seatMap.forEach((cell) => {
    if (!cell) {
      return;
    }

    const rowValue = cell.row ?? "";
    const rowKey = String(rowValue);
    let rowEntry = rowsMap.get(rowKey);

    if (!rowEntry) {
      rowEntry = {
        rowValue,
        columns: new Map(),
        maxCol: 0,
      };
      rowsMap.set(rowKey, rowEntry);
    }

    let colNumber = Number(cell.col);
    if (!Number.isFinite(colNumber) || colNumber <= 0) {
      colNumber = rowEntry.columns.size + 1;
    }

    rowEntry.columns.set(colNumber, cell);
    if (colNumber > rowEntry.maxCol) {
      rowEntry.maxCol = colNumber;
    }

    if (colNumber > maxCols) {
      maxCols = colNumber;
    }
  });

  const rowEntries = Array.from(rowsMap.values());
  const numericRows = rowEntries.every((row) =>
    Number.isFinite(Number(row.rowValue)),
  );

  rowEntries.sort((a, b) => {
    if (numericRows) {
      return Number(a.rowValue) - Number(b.rowValue);
    }

    return String(a.rowValue).localeCompare(String(b.rowValue), "fr", {
      numeric: true,
      sensitivity: "base",
    });
  });

  const rows = rowEntries.map((rowEntry) => {
    const cells = Array.from({ length: maxCols }, () => null);

    rowEntry.columns.forEach((cell, colNumber) => {
      const index = Math.max(0, colNumber - 1);
      if (index < cells.length) {
        cells[index] = cell;
      }
    });

    return {
      label: String(rowEntry.rowValue),
      rowValue: rowEntry.rowValue,
      cells,
    };
  });

  const indexByKey = new Map();
  rows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, colIndex) => {
      if (!cell) {
        return;
      }

      if (isAisleCell(cell)) {
        return;
      }

      indexByKey.set(seatKey(cell.row, cell.col), { rowIndex, colIndex });
    });
  });

  return { rows, maxCols, indexByKey };
};

// Seat number shown to people: aisles ("couloir") do not count, so a row
// chair, chair, aisle, chair is numbered 1, 2, -, 3. Mirrors the server's
// utils/seatNumbers.js; `col` is only the grid position.
export const buildSeatNumberMap = (seatMap = []) => {
  const chairsByRow = new Map();

  (Array.isArray(seatMap) ? seatMap : []).forEach((cell) => {
    if (!cell || isAisleCell(cell)) {
      return;
    }
    const row = String(cell.row ?? "").trim();
    const col = Number(cell.col);
    if (!row || !Number.isFinite(col)) {
      return;
    }
    if (!chairsByRow.has(row)) {
      chairsByRow.set(row, []);
    }
    chairsByRow.get(row).push(col);
  });

  const map = new Map();
  chairsByRow.forEach((cols, row) => {
    cols
      .sort((a, b) => a - b)
      .forEach((col, index) => {
        map.set(seatKey(row, col), index + 1);
      });
  });

  return map;
};

// Falls back to the grid column for seats saved before seat numbers existed.
export const formatSeatLabel = (seat) => {
  if (!seat) {
    return "";
  }
  return `${seat.row ?? ""}${seat.number ?? seat.col ?? ""}`;
};
