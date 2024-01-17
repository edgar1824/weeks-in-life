"use strict";
// Variables
const form = document.querySelector("form");
const container = document.querySelector(".container");
const total = document.querySelector(".total");
const root_styles = getComputedStyle(document.documentElement);
const cols_length = +root_styles.getPropertyValue("--weeks-row-length");
function toggleError(id, show, text) {
    const elem = document
        .querySelector(`input[id="${id}"]`)
        ?.closest("label")
        ?.querySelector(".error");
    if (elem) {
        elem?.classList[show ? "add" : "remove"]("show");
        if (text !== undefined || text !== null) {
            elem.innerHTML = text;
        }
    }
}
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const birth_date = new Date(data["birth-date"]);
    const max_age = +data["max-age"];
    const weeks = {}, date = new Date(birth_date);
    if (max_age > 120) {
        toggleError("max-age", true, "Must be less than 120");
        return;
    }
    else if (!data["max-age"]) {
        toggleError("max-age", true, "Required");
        return;
    }
    else if (max_age < 1) {
        toggleError("max-age", true, "and more than 0");
        return;
    }
    else {
        toggleError("max-age", false);
    }
    if (!data["birth-date"]) {
        toggleError("birth-date", true, "Required");
        return;
    }
    else if (birth_date.getTime() > new Date().getTime()) {
        toggleError("birth-date", true, "Wrong Date");
        return;
    }
    else {
        toggleError("birth-date", false);
    }
    container.innerHTML = "";
    const max_date = new Date(date);
    max_date.setFullYear(max_age + birth_date.getFullYear());
    max_date.setDate(max_date.getDate() + 1);
    while (date.getTime() < max_date.getTime()) {
        const year = new Date(date).getFullYear();
        if (!weeks[year])
            weeks[year] = [];
        while (date.getFullYear() === year && date.getTime() < max_date.getTime()) {
            if (date.getDay() === 0) {
                weeks[year].push([new Date(date)]);
            }
            else {
                const last_year = weeks[year];
                if (!last_year[Math.max(last_year.length - 1, 0)]) {
                    last_year[Math.max(last_year.length - 1, 0)] = [];
                }
                last_year[Math.max(last_year.length - 1, 0)].push(new Date(date));
            }
            date.setDate(date.getDate() + 1);
        }
        if (date.getTime() < max_date.getTime() &&
            date.getFullYear() > year &&
            date.getDay() > 0) {
            while (date.getDay() > 0) {
                if (date.getDay() === 0) {
                    weeks[year].push([new Date(date)]);
                }
                else {
                    const last_year = weeks[year];
                    if (!last_year[Math.max(last_year.length - 1, 0)]) {
                        last_year[Math.max(last_year.length - 1, 0)] = [];
                    }
                    last_year[Math.max(last_year.length - 1, 0)].push(new Date(date));
                }
                date.setDate(date.getDate() + 1);
            }
        }
    }
    total.innerHTML = `Total weeks: ${[...Object.values(weeks)].reduce((cur, week) => cur + week.length, 0)}, (${[...Object.entries(weeks)]
        .filter(([year]) => +year <= new Date().getFullYear())
        .map(([_, v]) => v)
        .reduce((cur, week) => cur + week.length, 0)} lived), Total Days: ${[
        ...Object.values(weeks),
    ].reduce((cur, week) => cur + week.reduce((c, w) => c + w.length, 0), 0)}`;
    let row_index = 0, col_index = 0, gl_index = 0;
    Object.entries(weeks).forEach(([key, weeks_arr], year_index) => {
        const year = +key;
        let start_col = col_index, end_col = (weeks_arr.length + col_index) % cols_length, start_row = row_index, end_row = Math.ceil((weeks_arr.length + gl_index) / cols_length);
        // console.log(key, { start_col, end_col, start_row, end_row });
        weeks_arr.forEach((week, i) => {
            if (col_index === cols_length) {
                row_index++;
                col_index = 0;
            }
            const week_wrapper = document.createElement("div");
            week_wrapper.className = "week-wrapper";
            week_wrapper.innerHTML = `<div class="week"></div>`;
            // start of row
            if ((col_index === start_col && row_index === start_row) ||
                col_index === 0) {
                week_wrapper.style.borderLeft = "2px solid";
            }
            // end of row
            if ((col_index + 1 === end_col &&
                row_index + 1 === end_row &&
                year_index === Object.entries(weeks).length - 1) ||
                col_index + 1 === cols_length) {
                week_wrapper.style.borderRight = "2px solid";
            }
            // start of col
            if (row_index === start_row && col_index >= start_col) {
                week_wrapper.style.borderTop = "2px solid";
            }
            // end of col
            if ((row_index + 1 === end_row && col_index <= end_col) ||
                (row_index === end_row - 2 &&
                    col_index > end_col - 1 &&
                    year_index === Object.entries(weeks).length - 1) ||
                (end_col === 0 && row_index === end_row - 1)) {
                week_wrapper.style.borderBottom = "2px solid";
            }
            if (week[week.length - 1].getTime() <= new Date().getTime()) {
                week_wrapper.querySelector(".week")?.classList.add("past");
            }
            col_index++;
            gl_index++;
            container.append(week_wrapper);
            // displaying current year in the center
            if (i === Math.ceil(weeks_arr.length / 2)) {
                const year_elem = document.createElement("span");
                year_elem.className = "weeks-year";
                year_elem.innerHTML = year + "";
                week_wrapper.append(year_elem);
                week_wrapper.style.zIndex = "2";
            }
        });
    });
});
