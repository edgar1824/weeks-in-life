"use strict";
// Variables
const form = document.querySelector("form");
const container = document.querySelector(".container");
const total = document.querySelector(".total");
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
    const weeks = [[]], date = new Date(birth_date);
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
    while (date.getFullYear() - birth_date.getFullYear() < max_age ||
        date.getMonth() < birth_date.getMonth() ||
        date.getDate() <= birth_date.getDate()) {
        if (date.getDay() === 0) {
            weeks.push([new Date(date)]);
        }
        else {
            weeks[weeks.length - 1].push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    total.innerHTML = `${weeks.length} weeks (${weeks.reduce((cur, week) => week[week.length - 1].getTime() <= new Date().getTime() ? cur + 1 : cur, 0)} lived), ${weeks.reduce((cur, week) => cur + week.length, 0)} days`;
    weeks.forEach((week) => {
        const week_elem = document.createElement("div");
        week_elem.className = "box";
        if (week[week.length - 1].getTime() <= new Date().getTime()) {
            week_elem.classList.add("past");
        }
        container.append(week_elem);
    });
});
