import React, { useEffect, useRef } from 'react';

const FilterPanel = ({
  headers,
  fieldTypes,
  filterField,
  setFilterField,
  filterValue,
  setFilterValue,
  rangeValues,
  setRangeValues,
  dateRange,
  setDateRange,
  onApply,
  onClear,
  resetSort
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [filterField]);

  const handleClearInput = () => {
    // Clear based on field type
    if (
      fieldTypes.range.includes(filterField) ||
      fieldTypes.number.includes(filterField) ||
      fieldTypes.yearDropdown.includes(filterField)
    ) {
      setRangeValues(["", ""]);
    } else if (fieldTypes.date.includes(filterField)) {
      setDateRange({ from: "", to: "" });
    } else {
      setFilterValue("");
    }

    // Reset filter field and sort
    setFilterField("");
    resetSort();
  };

  // --- Render Input Fields Based on Type ---
  const renderRangeInputs = () => (
    <>
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        step="any"
        placeholder="From"
        value={rangeValues[0]}
        onChange={(e) =>
          setRangeValues([
            e.target.value === "" ? "" : +e.target.value,
            rangeValues[1]
          ])
        }
        className="filter-input"
      />
      <input
        type="number"
        inputMode="numeric"
        step="any"
        placeholder="To"
        value={rangeValues[1]}
        onChange={(e) =>
          setRangeValues([
            rangeValues[0],
            e.target.value === "" ? "" : +e.target.value
          ])
        }
        className="filter-input"
      />
    </>
  );

  const renderDateInputs = () => (
    <>
      <input
        ref={inputRef}
        type="date"
        value={dateRange.from}
        onChange={(e) =>
          setDateRange({ ...dateRange, from: e.target.value })
        }
        className="filter-input"
        placeholder="From Date"
      />
      <input
        type="date"
        value={dateRange.to}
        onChange={(e) =>
          setDateRange({ ...dateRange, to: e.target.value })
        }
        className="filter-input"
        placeholder="To Date"
      />
    </>
  );

  const renderYesNoDropdown = () => (
    <select
      ref={inputRef}
      value={filterValue}
      onChange={(e) => setFilterValue(e.target.value)}
      className="filter-input"
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );

  const renderYearRange = () => (
    <>
      <input
        ref={inputRef}
        type="number"
        min={1}
        max={100}
        value={rangeValues[0]}
        onChange={(e) => setRangeValues([e.target.value, rangeValues[1]])}
        placeholder="Start Year"
        className="filter-input"
      />
      <input
        type="number"
        min={1}
        max={100}
        value={rangeValues[1]}
        onChange={(e) => setRangeValues([rangeValues[0], e.target.value])}
        placeholder="End Year"
        className="filter-input"
      />
    </>
  );

  const renderTextInput = () => (
    <input
      ref={inputRef}
      type="text"
      value={filterValue}
      onChange={(e) => setFilterValue(e.target.value)}
      placeholder="Search Text"
      className="filter-input"
    />
  );

  const renderInput = () => {
    if (!filterField) return null;

    if (
      fieldTypes.range.includes(filterField) ||
      fieldTypes.number.includes(filterField)
    ) {
      return renderRangeInputs();
    }
    if (fieldTypes.date.includes(filterField)) return renderDateInputs();
    if (fieldTypes.yesNo.includes(filterField)) return renderYesNoDropdown();
    if (fieldTypes.yearDropdown.includes(filterField)) return renderYearRange();
    return renderTextInput();
  };

  return (
    <div className="filter-panel-row">
      <div className="filter-input-group">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="filter-input"
        >
          <option value="">Select Filter</option>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {renderInput()}
      </div>

      <div className="filter-input-group">
        <button onClick={onApply} className="filter-btn apply">
          Apply
        </button>
        <button
          onClick={() => {
            handleClearInput();
            onClear();
          }}
          className="filter-btn clear"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
